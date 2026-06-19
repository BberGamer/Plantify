// useProductActions.js - Hook tạo / sửa / xóa sản phẩm
import { useState } from "react";
import { createProduct, updateProduct, deleteProduct } from "../api";

/**
 * Hook tạo mới một sản phẩm.
 * @returns {{ create: Function, loading: boolean, error: string|null, success: boolean }}
 */
export function useCreateProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const create = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await createProduct(data);
      setSuccess(true);
      setLoading(false);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
      throw err;
    }
  };

  return { create, loading, error, success };
}

/**
 * Hook cập nhật một sản phẩm.
 * @returns {{ update: Function, loading: boolean, error: string|null, success: boolean }}
 */
export function useUpdateProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const update = async (id, data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await updateProduct(id, data);
      setSuccess(true);
      setLoading(false);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
      throw err;
    }
  };

  return { update, loading, error, success };
}

/**
 * Hook xóa một sản phẩm.
 * @returns {{ remove: Function, loading: boolean, error: string|null, success: boolean }}
 */
export function useDeleteProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const remove = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deleteProduct(id);
      setSuccess(true);
      setLoading(false);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
      throw err;
    }
  };

  return { remove, loading, error, success };
}
