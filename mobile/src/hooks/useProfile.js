import getErrorMessage from "../utils/getErrorMessage";
import { useEffect, useRef, useState } from "react";
import useLogout from "./useLogout";
import useAuthStore from "../../store/authStore";
import { getSessionContext, isSessionCurrent } from "../services/sessionAccess";
import useScreenScope from "./useScreenScope";

// State và thao tác lưu/đăng xuất tách khỏi giao diện.
export default function useProfile() {
  const { isLoggingOut, logoutError, handleLogout } = useLogout();
  // Subscribe riêng user: giao diện tự cập nhật khi thông tin trong store thay đổi.
  // Không gọi loadUser/login ở đây; root layout đã chịu trách nhiệm nạp phiên.
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const sessionVersion = useAuthStore((state) => state.sessionVersion);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState("");
  //dùng useRef chống gọi API nhiều lần tránh người dùng spam
  const savePending = useRef(false);
  const mounted = useRef(false);
  const { capture, isActive } = useScreenScope();
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    savePending.current = false;
    setEditing(false);
    setForm({});
    setMessage("");
    setSaving(false);
  }, [sessionVersion]);

  // Form là bản nháp riêng: gõ/Hủy không thay đổi thông tin thật trong store.
  const startEditing = () => {
    if (savePending.current || isLoggingOut || !isActive()) return;
    setForm({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setMessage("");
    setEditing(true);
  };
  const cancelEditing = () => {
    if (savePending.current) return;
    setEditing(false);
    setForm({});
    setMessage("");
  };
  const changeField = (key, value) => {
    if (savePending.current || isLoggingOut || !editing ||
        !Object.prototype.hasOwnProperty.call(form, key)) return;
    setForm((previous) => ({ ...previous, [key]: value }));
    setMessage("");
  };
  const saveProfile = async () => {
    if (savePending.current || isLoggingOut || !editing || !isActive()) return;
    const inScope = capture();
    const origin = getSessionContext();
    if (origin.version !== sessionVersion || !origin.token) return;
    if (form.newPassword !== form.confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp.");
      return;
    }
    const attempt = {};
    savePending.current = attempt;
    setSaving(true);
    setMessage("");
    try {
      // Bỏ trống mật khẩu mới nghĩa là giữ mật khẩu cũ; không gửi confirmPassword.
      const result = await updateProfile({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        ...(form.currentPassword ? { currentPassword: form.currentPassword } : {}),
        ...(form.newPassword ? { newPassword: form.newPassword } : {}),
      }, origin);
      if (!inScope() || result.cancelled) return;
      setEditing(false);
      setForm({}); // Xóa mật khẩu khỏi state sau khi lưu.
      setMessage(
        result.cacheSaved
          ? "Đã lưu hồ sơ."
          : "Đã lưu trên máy chủ, nhưng chưa lưu được bộ nhớ trên thiết bị.",
      );
    } catch (error) {
      if (!inScope()) return;
      setMessage(
        getErrorMessage(error, "Không thể lưu hồ sơ. Vui lòng thử lại."),
      );
    } finally {
      if (savePending.current === attempt) savePending.current = false;
      if (mounted.current && isSessionCurrent(origin)) setSaving(false);
    }
  };

  return {
    user,
    editing,
    saving,
    form,
    changeField,
    message,
    startEditing,
    cancelEditing,
    saveProfile,
    isLoggingOut,
    logoutError,
    handleLogout: () => {
      if (!savePending.current) handleLogout();
    },
  };
}
