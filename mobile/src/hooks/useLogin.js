import getErrorMessage from "../utils/getErrorMessage";
// useLogin.js - Quản lý form đăng nhập; root guard điều hướng theo phiên.
import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import useAuthStore from "../../store/authStore";
import useScreenScope from "./useScreenScope";

export default function useLogin() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoggingIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const pending = useRef(null);
  const { capture, isActive } = useScreenScope(undefined, undefined, undefined, false);
  const isPending = () => {
    const state = useAuthStore.getState();
    return state.isLoggingIn || pending.current?.version === state.sessionVersion;
  };
  const submit = async () => {
    if (isPending() || !isActive()) return;
    const inScreen = capture(false);
    if (!email.trim() || !password) {
      setFieldErrors({
        ...(!email.trim() && { email: "Vui lòng nhập địa chỉ email." }),
        ...(!password && { password: "Vui lòng nhập mật khẩu." }),
      });
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
    setFieldErrors({});
    try {
      const request = login(email.trim(), password, inScreen);
      attempt.version = useAuthStore.getState().sessionVersion;
      const response = await request;
      if (!inScreen() || pending.current !== attempt) return;
      if (response.success) setPassword("");
      else if (!response.cancelled) setLocalError(response.error || "Đăng nhập thất bại.");
    } catch (failure) {
      if (inScreen() && pending.current === attempt)
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
    fieldErrors,
    submit,
    changeEmail: (value) => {
      if (!isPending()) {
        setEmail(value);
        setFieldErrors((previous) => ({ ...previous, email: undefined }));
        setLocalError("");
      }
    },
    changePassword: (value) => {
      if (!isPending()) {
        setPassword(value);
        setFieldErrors((previous) => ({ ...previous, password: undefined }));
        setLocalError("");
      }
    },
    forgotPassword: () => { if (!isPending()) router.push("/(auth)/reset-password"); },
    register: () => { if (!isPending()) router.push("/(auth)/register"); },
    googleLogin: () =>
      setLocalError("Tính năng đăng nhập bằng Google đang được phát triển."),
  };
}
