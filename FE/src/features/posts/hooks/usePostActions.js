// usePostActions.js - Quản lý trạng thái tạo, sửa và xóa bài viết của khách hàng
import { useState } from "react";
import { createPost, deletePost, updatePost } from "../api";

/** Lấy thông báo lỗi phù hợp từ response hoặc Error. @param {Object} error - Lỗi request. @returns {string} Thông báo lỗi. */
function getErrorMessage(error) {
  return error.response?.data?.message || error.message;
}

/** Quản lý request tạo bài viết và trạng thái lỗi/loading. @returns {Object} Action create cùng trạng thái request. */
export function useCreatePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const create = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await createPost(data);
      setSuccess(true);
      setLoading(false);
      return response;
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
      throw err;
    }
  };

  return { create, loading, error, success };
}

/** Quản lý request cập nhật bài viết và trạng thái lỗi/loading. @returns {Object} Action update cùng trạng thái request. */
export function useUpdatePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const update = async (id, data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await updatePost(id, data);
      setSuccess(true);
      setLoading(false);
      return response;
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
      throw err;
    }
  };

  return { update, loading, error, success };
}

/** Quản lý request xóa bài viết và trạng thái lỗi/loading. @returns {Object} Action remove cùng trạng thái request. */
export function useDeletePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const remove = async (id) => {
    setLoading(true);
    setDeletingId(id);
    setError(null);
    setSuccess(false);

    try {
      const response = await deletePost(id);
      setSuccess(true);
      return response;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
      setDeletingId(null);
    }
  };

  return { remove, loading, error, success, deletingId };
}
