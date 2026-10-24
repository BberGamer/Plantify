import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";

// State và thao tác lưu/đăng xuất tách khỏi giao diện.
export default function useProfile() {
  const router = useRouter();
  // Subscribe riêng user: giao diện tự cập nhật khi thông tin trong store thay đổi.
  // Không gọi loadUser/login ở đây; root layout đã chịu trách nhiệm nạp phiên.
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState("");
  //dùng useRef chống gọi API nhiều lần tránh người dùng spam
  const savePending = useRef(false);
  
  // Form là bản nháp riêng: gõ/Hủy không thay đổi thông tin thật trong store.
  const startEditing = () => {
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
    setEditing(false);
    setForm({});
    setMessage("");
  };
  const saveProfile = async () => {
    if (savePending.current) return;
    if (form.newPassword !== form.confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp.");
      return;
    }
    savePending.current = true;
    setSaving(true);
    setMessage("");
    try {
      // Bỏ trống mật khẩu mới nghĩa là giữ mật khẩu cũ; không gửi confirmPassword.
      const result = await updateProfile({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        currentPassword: form.currentPassword,
        ...(form.newPassword ? { newPassword: form.newPassword } : {}),
      });
      setEditing(false);
      setForm({}); // Xóa mật khẩu khỏi state sau khi lưu.
      setMessage(
        result.cacheSaved
          ? "Đã lưu hồ sơ."
          : "Đã lưu trên server, nhưng chưa lưu được bộ nhớ trên máy.",
      );
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Không thể lưu hồ sơ. Vui lòng thử lại.",
      );
    } finally {
      savePending.current = false;
      setSaving(false);
    }
  };
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  // Ref chặn hai lần bấm liên tiếp trước khi React cập nhật trạng thái nút.
  const logoutPending = useRef(false);

  const handleLogout = async () => {
    if (logoutPending.current) return;
    logoutPending.current = true;
    setIsLoggingOut(true);
    setLogoutError("");
    try {
      // Store đã có sẵn việc gọi API logout, xóa token/user trong AsyncStorage
      // và đưa isAuthenticated về false. Không tự xóa dữ liệu trùng ở màn hình.
      await logout();
      // Thay trang hiện tại bằng Login sau khi phiên đã được xóa.
      // AuthGuard vẫn chặn truy cập trang riêng tư khi chưa đăng nhập.
      router.replace("/(auth)/login");
    } catch (error) {
      // Nếu xóa phiên trên máy thất bại, giữ màn hình để người dùng thử lại.
      setLogoutError("Chưa thể đăng xuất. Vui lòng thử lại.");
    } finally {
      logoutPending.current = false;
      setIsLoggingOut(false);
    }
  };

  return { user, editing, saving, form, setForm, message,
    startEditing, cancelEditing, saveProfile, isLoggingOut, logoutError, handleLogout };
}
