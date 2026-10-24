import getErrorMessage from "../utils/getErrorMessage";
// useLogin.js - Quản lý form đăng nhập; root guard điều hướng theo phiên.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import useAuthStore from "../../store/authStore";

export default function useLogin() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoggingIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const pending = useRef(null);
  const isPending = () => {
    const state = useAuthStore.getState();
    return state.isLoggingIn || pending.current?.version === state.sessionVersion;
  };
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const submit = async () => {
    if (isPending()) return;
    if (!email.trim() || !password) {
      setLocalError(
        !email.trim()
          ? "Vui lòng nhập địa chỉ email"
          : "Vui lòng nhập mật khẩu",
      );
      return;
    }
    const attempt = {};
    pending.current = attempt;
    setLocalError("");
    try {
      const request = login(email.trim(), password);
      attempt.version = useAuthStore.getState().sessionVersion;
      const response = await request;
      if (!mounted.current || pending.current !== attempt) return;
      if (response.success) setPassword("");
      else if (!response.cancelled) setLocalError(response.error || "Đăng nhập thất bại.");
    } catch (failure) {
      if (mounted.current && pending.current === attempt)
        setLocalError(getErrorMessage(failure, "Đăng nhập thất bại"));
    } finally {
      if (pending.current === attempt) pending.current = null;
    }
  };

  return {
    email,
    password,
    isLoading,
    error: localError,
    submit,
    changeEmail: (value) => {
      if (!isPending()) {
        setEmail(value);
        setLocalError("");
      }
    },
    changePassword: (value) => {
      if (!isPending()) {
        setPassword(value);
        setLocalError("");
      }
    },
    forgotPassword: () => router.push("/(auth)/reset-password"),
    register: () => router.push("/(auth)/register"),
    googleLogin: () =>
      setLocalError("Tính năng đăng nhập bằng Google đang được phát triển."),
  };
}
