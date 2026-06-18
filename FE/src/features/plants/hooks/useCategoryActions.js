// useCategoryActions.js - Hook tạo / xóa danh mục cây
import { useState, useCallback } from "react";
import { createCategory, deleteCategory } from "../api";

/**
 * Hook tạo danh mục cây
 * @returns {{ create: function, loading: boolean }}
 */
export function useCreateCategory() {
  const [loading, setLoading] = useState(false);

  const create = useCallback(async (data) => {
    setLoading(true);
    try {
      return await createCategory(data);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading };
}

/**
 * Hook xóa danh mục cây
 * @returns {{ remove: function, loading: boolean }}
 */
export function useDeleteCategory() {
  const [loading, setLoading] = useState(false);

  const remove = useCallback(async (id) => {
    setLoading(true);
    try {
      return await deleteCategory(id);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { remove, loading };
}
