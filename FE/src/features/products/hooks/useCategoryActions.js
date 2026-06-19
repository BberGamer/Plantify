// useCategoryActions.js - Hook tạo / sửa / xóa danh mục sản phẩm
import { useState, useCallback } from "react";
import { createCategory, deleteCategory, updateCategory } from "../api";

/**
 * Hook tạo danh mục sản phẩm
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
 * Hook xóa danh mục sản phẩm
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

/**
 * Hook cập nhật danh mục sản phẩm
 * @returns {{ update: function, loading: boolean }}
 */
export function useUpdateCategory() {
  const [loading, setLoading] = useState(false);

  const update = useCallback(async (id, data) => {
    setLoading(true);
    try {
      return await updateCategory(id, data);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading };
}
