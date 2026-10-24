import getErrorMessage from "../utils/getErrorMessage";
// useLogin.js - Quản lý form đăng nhập và điều hướng theo vai trò.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import useAuthStore from "../../store/authStore";

const ROLE_ROUTES = {
  admin: "/admin",
  manager: "/manager",
  customer: "/(tabs)",
};

export default function useLogin() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const pending = useRef(false);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const submit = async () => {
    if (pending.current) return;
    clearError();
    if (!email.trim() || !password) {
      setLocalError(
        !email.trim()
          ? "Vui lòng nhập địa chỉ email"
          : "Vui lòng nhập mật khẩu",
      );
      return;
    }
    pending.current = true;
    setLocalError("");
    try {
      const response = await login(email.trim(), password);
      if (!mounted.current) return;
      if (response.success)
        router.replace(ROLE_ROUTES[response.user?.role] || "/(tabs)");
      else setLocalError(getErrorMessage(response.error, "Đăng nhập thất bại"));
    } catch (failure) {
      if (mounted.current)
        setLocalError(getErrorMessage(failure, "Đăng nhập thất bại"));
    } finally {
      pending.current = false;
    }
  };

  return {
    email,
    password,
    isLoading,
    error: localError || error,
    submit,
    changeEmail: (value) => {
      if (!pending.current) {
        setEmail(value);
        setLocalError("");
        clearError();
      }
    },
    changePassword: (value) => {
      if (!pending.current) {
        setPassword(value);
        setLocalError("");
        clearError();
      }
    },
    forgotPassword: () => router.push("/(auth)/reset-password"),
    register: () => router.push("/(auth)/register"),
    googleLogin: () =>
      setLocalError("Tính năng đăng nhập bằng Google đang được phát triển."),
  };
}
