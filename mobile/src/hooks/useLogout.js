// useLogout.js - Dùng chung trạng thái và bảo vệ thao tác đăng xuất.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import useAuthStore from "../../store/authStore";

export default function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const pending = useRef(false);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const handleLogout = async () => {
    if (pending.current) return;
    pending.current = true;
    setIsLoggingOut(true);
    setLogoutError("");
    try {
      await logout();
      if (mounted.current) router.replace("/(auth)/login");
    } catch {
      if (mounted.current)
        setLogoutError("Chưa thể đăng xuất. Vui lòng thử lại.");
    } finally {
      pending.current = false;
      if (mounted.current) setIsLoggingOut(false);
    }
  };
  return { isLoggingOut, logoutError, handleLogout };
}
