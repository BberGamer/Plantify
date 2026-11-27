import { useCallback, useRef, useState } from "react";
import gardenService from "../services/gardenService";
import getErrorMessage from "../utils/getErrorMessage";
import useScreenScope from "./useScreenScope";

export default function useGardenPlant(id) {
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deletePending, setDeletePending] = useState(false);
  const deleteLock = useRef(false);
  const request = useRef(0);
  const loadRef = useRef(null);
  const { capture, isActive } = useScreenScope(
    () => {
      setDeleting(false);
      setDeletePending(deleteLock.current);
      setDeleteError("");
      loadRef.current?.();
    },
    () => ++request.current,
    id,
  );
  const load = useCallback(async () => {
    if (!id || !isActive()) return;
    const requestId = ++request.current;
    const inScope = capture();
    const isCurrent = () => inScope() && requestId === request.current;
    setLoading(true);
    setError("");
    try {
      const response = await gardenService.getPlant(id);
      if (response?.success !== true || !response.data?._id)
        throw Object.assign(new Error("Dữ liệu cây không hợp lệ."), {
          code: "INVALID_RESPONSE",
        });
      if (isCurrent()) setPlant(response.data);
    } catch (failure) {
      if (isCurrent())
        setError(getErrorMessage(failure, "Không thể tải thông tin cây."));
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [capture, id, isActive]);
  loadRef.current = load;
  async function remove(onRemoved) {
    if (deleteLock.current || !isActive() || plant?._id !== id) return;
    deleteLock.current = true;
    setDeletePending(true);
    setDeleteError("");
    const current = capture();
    try {
      const response = await gardenService.removePlant(id);
      if (!response?.success || !response.data?.archived_at)
        throw new Error("Phản hồi xóa cây không hợp lệ.");
      if (current()) {
        setPlant(response.data);
        setDeleting(false);
        onRemoved();
      }
    } catch (failure) {
      if (current())
        setDeleteError(getErrorMessage(failure, "Không thể xóa cây khỏi vườn."));
    } finally {
      deleteLock.current = false;
      if (isActive()) setDeletePending(false);
    }
  }

  return {
    plant, loading, error, retry: load,
    deleting, deleteError, deletePending, remove,
    openDelete: () => {
      setDeleteError("");
      setDeleting(true);
    },
    closeDelete: () => setDeleting(false),
  };
}
