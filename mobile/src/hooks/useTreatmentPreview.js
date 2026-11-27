import { useRef, useState } from "react";
import useAuthStore from "../../store/authStore";
import treatmentService from "../services/treatmentService";
import collectGardenPlants from "../services/collectGardenPlants";
import { getSessionContext, isSessionCurrent } from "../services/sessionAccess";
import { newScheduleId, startTreatmentAttempt, treatmentAttempts } from "../services/treatmentAttempt";
import getErrorMessage from "../utils/getErrorMessage";
import treatmentLogic from "../utils/treatmentLogic.cjs";
import { invalidTreatmentResponse, isTreatmentSchedule } from "../utils/treatmentResponse";
import useScreenScope from "./useScreenScope";

export default function useTreatmentPreview({ diseaseId, plantId, userPlantId, diagnosisId, candidateRank, startDate }) {
  const version = useAuthStore((state) => state.sessionVersion);
  const key = JSON.stringify([version, diseaseId, plantId, userPlantId, diagnosisId, candidateRank, startDate]);
  const latestKey = useRef(key);
  latestKey.current = key;
  const [state, setState] = useState({});
  const request = useRef(0);
  const gardenRequest = useRef(0);
  const recoveryRequest = useRef(0);
  const loadRef = useRef(null);
  const scope = useScreenScope(() => loadRef.current?.(), () => {
    ++request.current;
    ++gardenRequest.current;
    ++recoveryRequest.current;
  }, key);
  const update = (patch) => setState((current) => ({
    ...(current.key === key ? current : {}), key, ...patch,
  }));
  const view = state.key === key ? state : {};
  const currentScope = () => {
    const inScope = scope.capture();
    return () => latestKey.current === key && inScope();
  };

  async function loadGarden() {
    if (!scope.isActive() || latestKey.current !== key) return;
    const current = currentScope();
    const id = ++gardenRequest.current;
    const valid = () => current() && id === gardenRequest.current;
    update({ gardenLoading: true, gardenError: "" });
    try {
      const plants = await collectGardenPlants(100, valid);
      if (!valid()) return;
      const compatible = [...new Map(plants.map((plant) => [plant._id, plant])).values()]
        .filter((plant) => String(plant.plant_id || "") === String(plantId));
      setState((previous) => {
        if (!valid()) return previous;
        const old = previous.key === key ? previous : {};
        const selected = old.selectedUserPlantId || userPlantId;
        return { ...old, key, gardenPlants: compatible, gardenLoading: false, gardenError: "",
          selectedUserPlantId: compatible.some((plant) => plant._id === selected && !plant.active_treatment)
            ? selected : compatible.find((plant) => !plant.active_treatment)?._id || "" };
      });
    } catch (failure) {
      if (valid()) update({ gardenLoading: false,
        gardenError: getErrorMessage(failure, "Không thể tải cây trong vườn. Phác đồ đã tạo vẫn được giữ lại.") });
    }
  }

  async function reconcile(attempt, registry, origin) {
    const current = currentScope();
    const id = ++recoveryRequest.current;
    const valid = () => current() && isSessionCurrent(origin) && id === recoveryRequest.current;
    update({ recovering: true, recoveryError: "", generating: attempt.kind === "generate" && attempt.pending,
      applying: attempt.kind === "apply" && attempt.pending });
    // Blur chỉ vô hiệu hóa UI cũ; POST vẫn có thể commit. Chờ request kết thúc rồi đọc lại.
    await attempt.promise;
    if (!valid()) return null;
    if (attempt.response?.success === true && isTreatmentSchedule(attempt.response.data)) {
      attempt.scheduleId = attempt.response.data._id;
    }
    const status = attempt.error?.response?.status;
    const rejected = status >= 400 && status < 500 && status !== 408;
    try {
      const response = await treatmentService.getSchedule(attempt.scheduleId, origin);
      if (!valid()) return null;
      if (response?.success !== true || !isTreatmentSchedule(response.data) ||
          response.data._id !== attempt.scheduleId || response.data.plant._id !== attempt.plantId ||
          response.data.disease._id !== diseaseId) throw invalidTreatmentResponse();
      const schedule = response.data;
      // Một GET còn thấy generated không chứng minh POST activate bị timeout đã dừng.
      const unresolved = attempt.kind === "apply" && schedule.status === "generated" &&
        !rejected && !(attempt.response?.success === true &&
          isTreatmentSchedule(attempt.response.data) && attempt.response.data.status !== "generated");
      update({ data: schedule, generating: false, applying: false, recovering: unresolved,
        recoveryError: unresolved ? "Chưa xác định được kết quả áp dụng. Hãy kiểm tra trạng thái trước khi thao tác tiếp." : "",
        applyError: rejected && attempt.kind === "apply" ? getErrorMessage(attempt.error) : "" });
      if (!unresolved) {
        attempt.confirmed = schedule;
      }
      return unresolved || (attempt.kind === "apply" && schedule.status !== "in_progress")
        ? null : schedule;
    } catch (failure) {
      if (!valid()) return null;
      if (rejected && attempt.kind === "generate" && failure.response?.status === 404) {
        registry.delete(key);
        update({ generating: false, applying: false, recovering: false,
          generateError: getErrorMessage(attempt.error, "Không thể tạo lịch điều trị.") });
      } else {
        update({ generating: false, applying: false, recovering: true,
          recoveryError: "Chưa đối chiếu được kết quả với server. Không gửi lại thao tác; hãy kiểm tra trạng thái." });
      }
      return null;
    }
  }

  async function load() {
    if (!scope.isActive() || latestKey.current !== key) return;
    const current = currentScope();
    const id = ++request.current;
    const origin = getSessionContext();
    const registry = treatmentAttempts(origin);
    const attempt = registry.get(key);
    update({ loading: true, error: "", generating: false, applying: false,
      recovering: !!attempt, recoveryError: "" });
    if (!diseaseId || !plantId) {
      update({ loading: false, error: "Kết quả chẩn đoán chưa có đủ thông tin cây và bệnh để tạo phác đồ." });
      return;
    }
    // Không có phụ thuộc: preview chỉ nhận diseaseId/plantId/diagnosisId, không nhận vườn.
    // Hai tác vụ tự quản lý lỗi; lỗi vườn không xóa preview thành công.
    void loadGarden();
    if (attempt) {
      await reconcile(attempt, registry, origin);
      if (current() && id === request.current) update({ loading: false });
      return;
    }
    update({ previewToken: "" });
    try {
      const response = await treatmentService.createPreview({ diseaseId, plantId, diagnosisId, candidateRank });
      if (!current() || id !== request.current) return;
      const protocol = response?.data?.protocol;
      const token = response?.data?.preview_token;
      if (response?.success !== true || !protocol || typeof token !== "string") throw invalidTreatmentResponse();
      update({ protocols: [protocol], selectedProtocolId: protocol._id, previewToken: token });
    } catch (failure) {
      if (current() && id === request.current) update({ error: getErrorMessage(failure, "Không thể tải phác đồ điều trị.") });
    } finally {
      if (current() && id === request.current) update({ loading: false });
    }
  }
  loadRef.current = load;

  async function run(kind) {
    if (latestKey.current !== key || !scope.isActive() || view.recovering || view.loading) return null;
    const origin = getSessionContext();
    const registry = treatmentAttempts(origin);
    const previous = registry.get(key);
    if (previous && !previous.confirmed) return null;
    const data = view.data;
    if (kind === "generate" && (data || view.gardenLoading || view.gardenError ||
        !view.previewToken || !view.selectedUserPlantId)) return null;
    if (kind === "apply" && !treatmentLogic.canApplyTreatment(data)) return null;
    const selectedPlant = kind === "apply" ? data.plant._id : view.selectedUserPlantId;
    const scheduleId = kind === "apply" ? data._id : newScheduleId();
    const attempt = startTreatmentAttempt(registry, key, kind, scheduleId, selectedPlant, () =>
      kind === "apply" ? treatmentService.activateSchedule(scheduleId, origin) :
        treatmentService.generateSchedule({ userPlantId: selectedPlant, diseaseId,
          previewToken: view.previewToken, diagnosisId, startDate, scheduleId, sessionContext: origin }));
    update({ generateError: "", applyError: "" });
    return reconcile(attempt, registry, origin);
  }

  return {
    data: view.data || null,
    protocols: view.protocols || [], gardenPlants: view.gardenPlants || [],
    selectedUserPlantId: view.selectedUserPlantId || "", selectedProtocolId: view.selectedProtocolId || "",
    loading: view.loading ?? true, error: view.error || "",
    gardenLoading: view.gardenLoading ?? true, gardenError: view.gardenError || "",
    generating: !!view.generating, generateError: view.generateError || "",
    applying: !!view.applying, applyError: view.applyError || "",
    recovering: !!view.recovering, recoveryError: view.recoveryError || "",
    canGenerate: Boolean(view.previewToken && view.selectedUserPlantId && !view.data &&
      !view.loading && !view.gardenLoading && !view.gardenError && !view.recovering),
    canApply: !view.recovering && !view.loading && treatmentLogic.canApplyTreatment(view.data),
    selectProtocol: (value) => { if (!view.recovering) update({ selectedProtocolId: value }); },
    selectGardenPlant: (value) => { if (!view.recovering) update({ selectedUserPlantId: value }); },
    retry: load, retryGarden: loadGarden,
    checkStatus: () => {
      const origin = getSessionContext();
      const registry = treatmentAttempts(origin);
      const attempt = registry.get(key);
      if (attempt && scope.isActive() && latestKey.current === key) return reconcile(attempt, registry, origin);
    },
    generate: () => run("generate"), apply: () => run("apply"),
  };
}

