import { getRoleLabel } from "../constants/roles";
// useHomeHeader.js - Điều phối menu tài khoản và đăng xuất tại Home.
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import useAuthStore from "../../store/authStore";
import useLogout from "./useLogout";

export default function useHomeHeader() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { handleLogout, isLoggingOut, logoutError } = useLogout();
  const roleLabel = getRoleLabel(user?.role);
  const openAdmin = () => router.push("/admin/users");
  const openAccountMenu = () => {
    if (isLoggingOut) return;
    Alert.alert(
      user ? `Xin chào, ${user.fullName || "Người dùng"}!` : "Tài khoản",
      user
        ? `Địa chỉ email: ${user.email}\nVai trò: ${roleLabel}`
        : "Bạn chưa đăng nhập",
      [
        { text: "Đóng", style: "cancel" },
        ...(user?.role === "admin"
          ? [{ text: "Quản lý người dùng", onPress: openAdmin }]
          : []),
        { text: "Đăng xuất", style: "destructive", onPress: handleLogout },
      ],
    );
  };
  return { roleLabel, user, openAdmin, openAccountMenu, isLoggingOut, logoutError };
}
