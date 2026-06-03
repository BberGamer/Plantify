// useAdminUsers.js - Hook lấy danh sách người dùng cho trang quản trị
import { useEffect, useState } from "react";
import { getUsersApi } from "../api";

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getUsersApi();

        if (isMounted) {
          setUsers(response.data || []);
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

  return {
    users,
    loading,
    error
  };
}

export default useAdminUsers;
