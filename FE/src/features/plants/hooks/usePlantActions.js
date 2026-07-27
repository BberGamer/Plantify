// usePlantActions.js - Quản lý trạng thái chỉnh sửa và xóa cây
import { useState, useCallback } from "react";
import { updatePlant, deletePlant } from "../api";

/** Quản lý mutation tạo, sửa, xóa cây và gọi callback sau thành công. @param {Function} [onSuccess] - Callback sau mutation thành công. @returns {Object} Các action và trạng thái request. */
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
