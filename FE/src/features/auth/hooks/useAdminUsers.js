// useAdminUsers.js - Hook lấy danh sách người dùng cho trang quản trị
import { useCallback, useEffect, useState } from "react";
import { createAdminUserApi, deleteUserApi, getUsersApi, updateUserStatusApi } from "../api";

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    const response = await createAdminUserApi(userData);
    await refetchUsers();
    return response;
  };

  const updateUserStatus = async (userId, status) => {
    const response = await updateUserStatusApi(userId, status);
    await refetchUsers();
    return response;
  };

  const deleteUser = async (userId) => {
    const response = await deleteUserApi(userId);
    await refetchUsers();
    return response;
  };

  return {
    users,
    loading,
    error,
    refetchUsers,
    createUser,
    updateUserStatus,
    deleteUser,
  };
}

export default useAdminUsers;
