// useLogout.js - Dùng chung trạng thái và bảo vệ thao tác đăng xuất.
import { useEffect, useRef, useState } from "react";
import useAuthStore from "../../store/authStore";
import { isSessionCurrent } from "../services/sessionAccess";
import useScreenScope from "./useScreenScope";

export default function useLogout() {
  const logout = useAuthStore((state) => state.logout);
  const sessionVersion = useAuthStore((state) => state.sessionVersion);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const pending = useRef(null);
  const mounted = useRef(false);
  const { capture, isActive } = useScreenScope(undefined, undefined, undefined, false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    setLogoutError("");
    if (pending.current && pending.current.version !== sessionVersion) {
      pending.current = null;
      setIsLoggingOut(false);
      setLogoutError("");
    }
  }, [sessionVersion]);
  const handleLogout = async () => {
    if (!isActive()) return;
    const inScreen = capture(false);
    if (pending.current?.version === useAuthStore.getState().sessionVersion) return;
    const attempt = {};
    pending.current = attempt;
    setIsLoggingOut(true);
    setLogoutError("");
    try {
      const request = logout();
      attempt.version = useAuthStore.getState().sessionVersion;
      const result = await request;
      if (inScreen() && isSessionCurrent(result.context) && !result.cacheCleared) {
        setLogoutError("Đã kết thúc phiên, nhưng chưa xóa được toàn bộ cache trên thiết bị.");
      }
    } catch {
      if (inScreen() && pending.current === attempt)
        setLogoutError("Chưa thể đăng xuất. Vui lòng thử lại.");
    } finally {
      if (pending.current === attempt) {
        pending.current = null;
        if (mounted.current) setIsLoggingOut(false);
      }
    }
  };
  return { isLoggingOut, logoutError, handleLogout };
}
