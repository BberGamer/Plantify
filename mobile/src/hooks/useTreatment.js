import { useCallback, useMemo, useRef, useState } from "react";
import treatmentService from "../services/treatmentService";
import getErrorMessage from "../utils/getErrorMessage";
import treatmentLogic from "../utils/treatmentLogic.cjs";
import useScreenScope from "./useScreenScope";

const invalidResponse = () =>
  Object.assign(new Error("Dữ liệu điều trị không hợp lệ."), {
    code: "INVALID_RESPONSE",
  });

const isSchedule = (value) =>
  Boolean(
    value &&
      typeof value === "object" &&
      typeof value._id === "string" &&
      typeof value.status === "string" &&
      value.protocol &&
      typeof value.protocol.standard_duration_days === "number" &&
      value.plant &&
      value.disease &&
      Array.isArray(value.stages) &&
      Array.isArray(value.task_progress),
  );

function useTreatmentResource(loader, contextKey) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const request = useRef(0);
  const loadRef = useRef(null);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const { capture, isActive } = useScreenScope(
    () => loadRef.current?.(Boolean(data)),
    () => ++request.current,
    contextKey,
  );

  const load = useCallback(
    async (refresh = false) => {
      if (!isActive()) return;
      const requestId = ++request.current;
      const inScope = capture();
      const isCurrent = () => inScope() && requestId === request.current;
      setLoading(!refresh);
      setRefreshing(refresh);
      setError("");
      try {
        const response = await loaderRef.current();
        if (!isCurrent()) return;
        if (response?.success !== true || !isSchedule(response.data))
          throw invalidResponse();
        setData(response.data);
      } catch (failure) {
        if (isCurrent()) setError(getErrorMessage(failure, "Không thể tải thông tin điều trị."));
      } finally {
        if (isCurrent()) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [capture, isActive],
  );
  loadRef.current = load;
  return { data, setData, loading, refreshing, error, retry: load, refresh: () => load(true), capture, isActive };
}

export function useTreatmentPreview({ diseaseId, userPlantId, diagnosisId, startDate }) {
  const [protocols, setProtocols] = useState([]);
  const [selectedProtocolId, setSelectedProtocolId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const request = useRef(0);
  const mutation = useRef(false);
  const loadRef = useRef(null);
  const [applying, setApplying] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [generateError, setGenerateError] = useState("");
  const contextKey = `${diseaseId || ""}:${userPlantId || ""}:${diagnosisId || ""}`;
  const { capture, isActive } = useScreenScope(
    () => loadRef.current?.(),
    () => ++request.current,
    contextKey,
  );

  const load = useCallback(async () => {
    if (!isActive()) return;
    if (!diseaseId || !userPlantId) {
      setLoading(false);
      setProtocols([]);
      setError("Cần chọn cây trong vườn và bệnh đã chẩn đoán để tạo phác đồ.");
      return;
    }
    const requestId = ++request.current;
    const inScope = capture();
    const isCurrent = () => inScope() && requestId === request.current;
    setLoading(true);
    setError("");
    try {
      const response = await treatmentService.getApprovedProtocols(diseaseId);
      const items = response?.data?.protocols;
      if (response?.success !== true || !Array.isArray(items)) throw invalidResponse();
      if (!isCurrent()) return;
      setProtocols(items);
      setSelectedProtocolId((current) =>
        items.some((item) => item._id === current) ? current : items[0]?._id || "",
      );
    } catch (failure) {
      if (isCurrent()) setError(getErrorMessage(failure, "Không thể tải phác đồ điều trị."));
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [capture, diseaseId, isActive, userPlantId]);
  loadRef.current = load;

  const generate = useCallback(async () => {
    if (mutation.current || !selectedProtocolId || !diseaseId || !userPlantId || !isActive()) return null;
    const isCurrent = capture();
    mutation.current = true;
    setGenerating(true);
    setGenerateError("");
    try {
      const response = await treatmentService.generateSchedule({
        userPlantId,
        diseaseId,
        treatmentProtocolId: selectedProtocolId,
        diagnosisId,
        startDate,
      });
      if (!isCurrent()) return null;
      if (response?.success !== true || !isSchedule(response.data)) throw invalidResponse();
      setData(response.data);
      return response.data;
    } catch (failure) {
      if (isCurrent()) setGenerateError(getErrorMessage(failure, "Không thể tạo lịch điều trị."));
      return null;
    } finally {
      mutation.current = false;
      if (isCurrent()) setGenerating(false);
    }
  }, [capture, diagnosisId, diseaseId, isActive, selectedProtocolId, startDate, userPlantId]);

  const apply = useCallback(async () => {
    if (mutation.current || !data || !treatmentLogic.canApplyTreatment(data) || !isActive()) return null;
    const isCurrent = capture();
    mutation.current = true;
    setApplying(true);
    setApplyError("");
    try {
      const response = await treatmentService.activateSchedule(data._id);
      if (!isCurrent()) return null;
      if (response?.success !== true || !isSchedule(response.data)) throw invalidResponse();
      setData(response.data);
      return response.data;
    } catch (failure) {
      if (isCurrent()) setApplyError(getErrorMessage(failure, "Không thể bắt đầu điều trị."));
      return null;
    } finally {
      mutation.current = false;
      if (isCurrent()) setApplying(false);
    }
  }, [capture, data, isActive]);
  return {
    data,
    protocols,
    selectedProtocolId,
    loading,
    error,
    generating,
    generateError,
    applying,
    applyError,
    canGenerate: Boolean(selectedProtocolId && diseaseId && userPlantId),
    canApply: treatmentLogic.canApplyTreatment(data),
    selectProtocol: setSelectedProtocolId,
    retry: load,
    generate,
    apply,
  };
}

export function useActiveTreatment(id) {
  const resource = useTreatmentResource(() => treatmentService.getSchedule(id), id);
  const mutation = useRef(false);
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [mutationError, setMutationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const progress = useMemo(() => treatmentLogic.calculateTreatmentProgress(resource.data), [resource.data]);

  const completeTask = useCallback(async (taskId) => {
    if (mutation.current || !resource.data || !resource.isActive()) return false;
    const task = resource.data.task_progress?.find((item) => item._id === taskId);
    if (!treatmentLogic.canCompleteTask(task)) return false;
    const isCurrent = resource.capture();
    mutation.current = true;
    setCompletingTaskId(taskId);
    setMutationError("");
    setSuccessMessage("");
    try {
      const response = await treatmentService.completeTask(resource.data._id, taskId);
      if (!isCurrent()) return false;
      if (response?.success !== true || !response.data) throw new Error("Không thể cập nhật công việc.");
      resource.setData(response.data);
      setSuccessMessage(response.message || "Đã cập nhật công việc điều trị.");
      await resource.refresh();
      return true;
    } catch (failure) {
      if (isCurrent()) setMutationError(getErrorMessage(failure, "Không thể cập nhật công việc."));
      return false;
    } finally {
      mutation.current = false;
      if (isCurrent()) setCompletingTaskId(null);
    }
  }, [resource]);

  return {
    ...resource,
    progress,
    completingTaskId,
    mutationError,
    successMessage,
    clearMessage: () => setSuccessMessage(""),
    completeTask,
  };
}

export function useTreatmentCompletion(id) {
  const resource = useTreatmentResource(() => treatmentService.getSchedule(id), `completion-${id}`);
  const mutation = useRef(false);
  const [outcome, setOutcome] = useState(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [completed, setCompleted] = useState(false);
  const progress = useMemo(() => treatmentLogic.calculateTreatmentProgress(resource.data), [resource.data]);

  const submit = useCallback(async () => {
    if (mutation.current || !outcome || !resource.data || !resource.isActive()) return false;
    const isCurrent = resource.capture();
    mutation.current = true;
    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await treatmentService.finishSchedule(resource.data._id, outcome, note);
      if (!isCurrent()) return false;
      if (response?.success !== true || !response.data) throw new Error("Không thể lưu kết quả điều trị.");
      resource.setData(response.data);
      setCompleted(true);
      return true;
    } catch (failure) {
      if (isCurrent()) setSubmitError(getErrorMessage(failure, "Không thể lưu kết quả điều trị."));
      return false;
    } finally {
      mutation.current = false;
      if (isCurrent()) setSubmitting(false);
    }
  }, [note, outcome, resource]);

  return { ...resource, progress, outcome, note, submitting, submitError, completed, selectOutcome: setOutcome, changeNote: setNote, submit };
}
