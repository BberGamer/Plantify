import { useRef, useState } from "react";
import useAuthStore from "../../store/authStore";
import careService from "../services/careService";
import getErrorMessage from "../utils/getErrorMessage";
import useCarePlants from "./useCarePlants";
import useScreenScope from "./useScreenScope";

const isPreview = (data) => Boolean(
  typeof data?.preview_token === "string" && data.preview_token && typeof data.plant_name === "string" &&
  Array.isArray(data.tasks) && data.tasks.length > 0 && data.tasks.every((task) =>
    typeof task?.action_type === "string" && typeof task.title === "string" &&
    /^\d{2}:\d{2}$/.test(task.time) && Number.isInteger(task.repeat_every_days) &&
    Array.isArray(task.steps) && task.steps.length >= 2) &&
  Array.isArray(data.sources) && data.sources.every((source) =>
    typeof source?.title === "string" && /^https:\/\/[^\s]+$/.test(source.url)),
);

export default function useCareGeneration({ plantId, preferredId, diagnosisId, candidateRank, fixedGardenPlant }) {
  const garden = useCarePlants();
  const session = useAuthStore((store) => store.sessionVersion);
  const key = JSON.stringify([session, plantId, diagnosisId, candidateRank, fixedGardenPlant ? preferredId : null]);
  const latestKey = useRef(key);
  latestKey.current = key;
  const [state, setState] = useState({});
  const view = state.key === key ? state : {};
  const previewRequest = useRef(0);
  const pendingApply = useRef(null);
  const scope = useScreenScope(() => {
    if (!plantId) return;
    update({ applying: pendingApply.current === key });
    if (!view.preview) void loadPreview();
  }, undefined, key);

  const plants = garden.plants.filter((plant) => plant.plant_id === plantId &&
    (!fixedGardenPlant || plant._id === preferredId));
  const eligible = plants.filter((plant) => !plant.active_treatment);
  const selected = eligible.find((plant) => plant._id === view.chosenId) ||
    eligible.find((plant) => plant._id === preferredId) ||
    (eligible.length === 1 ? eligible[0] : undefined);
  const canApply = Boolean(view.preview && selected && !garden.plantLoading && !garden.plantError &&
    !view.loading && !view.applying);

  function update(patch) {
    setState((previous) => ({ ...(previous.key === key ? previous : {}), key, ...patch }));
  }

  function capture() {
    const active = scope.capture();
    return () => latestKey.current === key && active();
  }

  async function loadPreview() {
    if (!plantId || !scope.isActive()) return;
    const request = ++previewRequest.current;
    const active = capture();
    const current = () => request === previewRequest.current && active();
    update({ loading: true, previewError: "", applyError: "" });
    try {
      const response = await careService.preview({ plantId, diagnosisId, candidateRank });
      if (!current()) return;
      if (!response?.success || !isPreview(response.data))
        throw new Error("Dữ liệu bản xem trước không hợp lệ.");
      update({ preview: response.data });
    } catch (failure) {
      if (current()) update({ previewError: getErrorMessage(failure, "Không thể chuẩn bị lịch chăm sóc.") });
    } finally {
      if (current()) update({ loading: false });
    }
  }

  async function apply() {
    if (!canApply || pendingApply.current === key || !scope.isActive()) return;
    const current = capture();
    pendingApply.current = key;
    update({ applying: true, applyError: "" });
    try {
      const response = await careService.apply(selected._id, view.preview.preview_token);
      if (!current()) return;
      if (!response?.success || !/^\d{4}-\d{2}-\d{2}$/.test(response.data?.date))
        throw new Error("Dữ liệu lịch chăm sóc không hợp lệ.");
      return { plantId: selected._id, date: response.data.date };
    } catch (failure) {
      if (!current()) return;
      const message = getErrorMessage(failure, "Không thể áp dụng lịch chăm sóc.");
      const code = failure?.response?.data?.code;
      if (code === "CARE_PREVIEW_EXPIRED" || code === "CARE_PREVIEW_INVALID")
        update({ preview: null, previewError: message });
      else update({ applyError: message });
    } finally {
      if (pendingApply.current === key) pendingApply.current = null;
      if (latestKey.current === key && scope.isActive()) update({ applying: false });
    }
  }

  return {
    ...garden,
    plants,
    eligibleCount: eligible.length,
    selected,
    select: (id) => {
      if (pendingApply.current !== key) update({ chosenId: id, applyError: "" });
    },
    preview: view.preview,
    loading: view.loading ?? Boolean(plantId),
    previewError: view.previewError || "",
    loadPreview,
    canApply,
    applying: Boolean(view.applying),
    applyError: view.applyError || "",
    apply,
  };
}
