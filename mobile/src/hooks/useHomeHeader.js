import { getRoleLabel } from "../constants/roles";
// useHomeHeader.js - Điều phối hồ sơ và thông báo tại Home.
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import useAuthStore from "../../store/authStore";
import notificationService from "../services/notificationService";
import { getSessionContext, isSessionCurrent } from "../services/sessionAccess";

export default function useHomeHeader() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const sessionVersion = useAuthStore((state) => state.sessionVersion);
  const [unread, setUnread] = useState(null);
  useFocusEffect(
    useCallback(() => {
      if (user?.role !== "customer") return;
      const session = getSessionContext();
      let active = true;
      let revision = 0;
      async function refreshUnread() {
        const requested = ++revision;
        try {
          const response = await notificationService.unreadCount(session);
          const count = response?.data?.count;
          if (
            active &&
            requested === revision &&
            isSessionCurrent(session) &&
            response?.success === true &&
            Number.isSafeInteger(count)
          )
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
    }, [user?.role, sessionVersion]),
  );
  const roleLabel = getRoleLabel(user?.role);
  const openAdmin = () => router.push("/admin/users");
  const openNotifications = () => router.navigate("/customer/notifications");
  const openProfile = () => {
    if (!user?.role) return;
    const routes = {
      customer: "/customer/profile",
      manager: "/manager/profile",
      admin: "/admin/profile",
    };
    if (routes[user.role]) router.push(routes[user.role]);
  };
  const unreadCount = unread?.version === sessionVersion ? unread.count : 0;
  return {
    roleLabel,
    user,
    openAdmin,
    openProfile,
    openNotifications,
    unreadCount,
  };
}
