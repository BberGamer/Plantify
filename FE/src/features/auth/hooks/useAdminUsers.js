// useAdminUsers.js - Quản lý trạng thái danh sách và thao tác người dùng quản trị
import { useCallback, useEffect, useState } from "react";
import { createAdminUserApi, deleteUserApi, getUsersApi, updateUserStatusApi } from "../api";

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdatingUserId, setStatusUpdatingUserId] = useState("");
  const [deleting, setDeleting] = useState(false);

  const refetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getUsersApi();
      setUsers(response.data || []);
      return response.data || [];
    } catch (err) {
      const nextError = err.response?.data?.message || "Không thể tải danh sách người dùng";
      setError(nextError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        const response = await getUsersApi();

        if (isMounted) {
          setUsers(response.data || []);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Không thể tải danh sách người dùng");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const createUser = async (userData) => {
    setSubmitting(true);
    try {
      const response = await createAdminUserApi(userData);
      await refetchUsers();
      return response;
    } finally {
      setSubmitting(false);
    }
  };

  const updateUserStatus = async (userId, status) => {
    setStatusUpdatingUserId(userId);
    try {
      const response = await updateUserStatusApi(userId, status);
      await refetchUsers();
      return response;
    } finally {
      setStatusUpdatingUserId("");
    }
  };

  const deleteUser = async (userId) => {
    setDeleting(true);
    try {
      const response = await deleteUserApi(userId);
      await refetchUsers();
      return response;
    } finally {
      setDeleting(false);
    }
  };

  return {
    users,
    loading,
    error,
    refetchUsers,
    createUser,
    updateUserStatus,
    deleteUser,
    deleting,
    statusUpdatingUserId,
    submitting,
  };
}

export default useAdminUsers;
