// usePlantActions.js - Hook xử lý edit/delete plant
import { useState, useCallback } from "react";
import { updatePlant, deletePlant } from "../api";

export const usePlantActions = (onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdate = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updatePlant(id, data);
      onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  const handleDelete = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await deletePlant(id);
      onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || "Xóa thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { handleUpdate, handleDelete, loading, error };
};
