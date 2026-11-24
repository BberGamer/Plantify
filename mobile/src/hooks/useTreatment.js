import { useCallback, useMemo, useRef, useState } from "react";
import treatmentService from "../services/treatmentService";
import getErrorMessage from "../utils/getErrorMessage";
import treatmentLogic from "../utils/treatmentLogic.cjs";
import {
  invalidTreatmentResponse,
  isTreatmentSchedule,
} from "../utils/treatmentResponse";
import useScreenScope from "./useScreenScope";

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
        if (response?.success !== true || !isTreatmentSchedule(response.data))
          throw invalidTreatmentResponse();
        setData(response.data);
      } catch (failure) {
        if (isCurrent())
          setError(
            getErrorMessage(failure, "Không thể tải thông tin điều trị."),
          );
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
  return {
    data,
    setData,
    loading,
    refreshing,
    error,
    retry: load,
    refresh: () => load(true),
    capture,
    isActive,
  };
}

export function useActiveTreatment(id) {
  const resource = useTreatmentResource(
    () => treatmentService.getSchedule(id),
    id,
  );
  const mutation = useRef(false);
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [mutationError, setMutationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const progress = useMemo(
    () => treatmentLogic.calculateTreatmentProgress(resource.data),
    [resource.data],
  );

  const completeTask = useCallback(
    async (taskId) => {
      if (mutation.current || !resource.data || !resource.isActive())
        return false;
      const task = resource.data.task_progress?.find(
        (item) => item._id === taskId,
      );
      if (!treatmentLogic.canCompleteTask(task)) return false;
      const isCurrent = resource.capture();
      mutation.current = true;
      setCompletingTaskId(taskId);
      setMutationError("");
      setSuccessMessage("");
      try {
        const response = await treatmentService.completeTask(
          resource.data._id,
          taskId,
        );
        if (!isCurrent()) return false;
        if (response?.success !== true || !response.data)
          throw new Error("Không thể cập nhật công việc.");
        resource.setData(response.data);
        setSuccessMessage(
          response.message || "Đã cập nhật công việc điều trị.",
        );
        await resource.refresh();
        return true;
      } catch (failure) {
        if (isCurrent())
          setMutationError(
            getErrorMessage(failure, "Không thể cập nhật công việc."),
          );
        return false;
      } finally {
        mutation.current = false;
        if (isCurrent()) setCompletingTaskId(null);
      }
    },
    [resource],
  );

  const editTask = useCallback(
    async (taskId, payload) => {
      if (mutation.current || !resource.data || !resource.isActive())
        return false;
      const task = resource.data.task_progress?.find(
        (item) => item._id === taskId,
      );
      if (!task) return false;
      const isCurrent = resource.capture();
      mutation.current = true;
      setEditingTaskId(taskId);
      setMutationError("");
      setSuccessMessage("");
      try {
        const response = await treatmentService.editTask(
          resource.data._id,
          taskId,
          payload,
        );
        if (!isCurrent()) return false;
        if (response?.success !== true || !response.data)
          throw new Error("Không thể lưu thay đổi phác đồ.");
        resource.setData(response.data);
        setSuccessMessage(
          response.message || "Đã cập nhật công việc điều trị.",
        );
        return true;
      } catch (failure) {
        if (isCurrent())
          setMutationError(
            getErrorMessage(failure, "Không thể lưu thay đổi phác đồ."),
          );
        return false;
      } finally {
        mutation.current = false;
        if (isCurrent()) setEditingTaskId(null);
      }
    },
    [resource],
  );

  return {
    ...resource,
    progress,
    completingTaskId,
    editingTaskId,
    mutationError,
    successMessage,
    clearMessage: () => setSuccessMessage(""),
    clearMutationError: () => setMutationError(""),
    completeTask,
    editTask,
  };
}

export function useTreatmentCompletion(id) {
  const resource = useTreatmentResource(
    () => treatmentService.getSchedule(id),
    `completion-${id}`,
  );
  const mutation = useRef(false);
  const [outcome, setOutcome] = useState(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [completed, setCompleted] = useState(false);
  const progress = useMemo(
    () => treatmentLogic.calculateTreatmentProgress(resource.data),
    [resource.data],
  );

  const submit = useCallback(async () => {
    if (mutation.current || !outcome || !resource.data || !resource.isActive())
      return false;
    const isCurrent = resource.capture();
    mutation.current = true;
    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await treatmentService.finishSchedule(
        resource.data._id,
        outcome,
        note,
      );
      if (!isCurrent()) return false;
      if (response?.success !== true || !response.data)
        throw new Error("Không thể lưu kết quả điều trị.");
      resource.setData(response.data);
      setCompleted(true);
      return true;
    } catch (failure) {
      if (isCurrent())
        setSubmitError(
          getErrorMessage(failure, "Không thể lưu kết quả điều trị."),
        );
      return false;
    } finally {
      mutation.current = false;
      if (isCurrent()) setSubmitting(false);
    }
  }, [note, outcome, resource]);

  return {
    ...resource,
    progress,
    outcome,
    note,
    submitting,
    submitError,
    completed,
    selectOutcome: setOutcome,
    changeNote: setNote,
    submit,
  };
}
