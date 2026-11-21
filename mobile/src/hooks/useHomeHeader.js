import { getRoleLabel } from "../constants/roles";
// useHomeHeader.js - Điều phối menu tài khoản và đăng xuất tại Home.
import { Alert } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import useAuthStore from "../../store/authStore";
import useLogout from "./useLogout";
import notificationService from "../services/notificationService";
import { getSessionContext, isSessionCurrent } from "../services/sessionAccess";

export default function useHomeHeader() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const sessionVersion = useAuthStore((state) => state.sessionVersion);
  const [unread, setUnread] = useState(null);
  useFocusEffect(useCallback(() => {
    if (user?.role !== "customer") return;
    const session = getSessionContext();
    let active = true;
    let revision = 0;
    async function refreshUnread() {
      const requested = ++revision;
      try {
        const response = await notificationService.unreadCount(session);
        const count = response?.data?.count;
        if (active && requested === revision && isSessionCurrent(session) &&
            response?.success === true && Number.isSafeInteger(count))
          setUnread({ version: session.version, count });
      } catch {
        // Giữ số cuối cùng trong phiên đến lần kết nối lại.
      }
    }
    void refreshUnread();
    const unsubscribe = notificationService.subscribe(session, refreshUnread);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [user?.role, sessionVersion]));
  const { handleLogout, isLoggingOut, logoutError } = useLogout();
  const roleLabel = getRoleLabel(user?.role);
  const openAdmin = () => router.push("/admin/users");
  const openNotifications = () => router.navigate("/customer/notifications");
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
  const unreadCount = unread?.version === sessionVersion ? unread.count : 0;
  return { roleLabel, user, openAdmin, openAccountMenu, openNotifications, unreadCount, isLoggingOut, logoutError };
}
