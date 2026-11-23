import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useRootNavigationState, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import useAuthStore from "../../store/authStore";
import notificationService from "../services/notificationService";
import { getSessionContext, isSessionCurrent } from "../services/sessionAccess";
import { clearPushBinding, flushRevocations, isCurrentPushBinding, syncPushDevice } from "../services/notificationDevice";
import { notificationRoute } from "../utils/notificationRoute";

export default function usePushNotifications() {
  const hydrated = useAuthStore(state => state.hasHydrated);
  const role = useAuthStore(state => state.user?.role);
  const version = useAuthStore(state => state.sessionVersion);
  const response = Notifications.useLastNotificationResponse();
  const navigationKey = useRootNavigationState()?.key;
  const router = useRouter();
  const handled = useRef(null);

  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    let running = false;
    let lastSync = 0;
    let queuedToken;
    const session = getSessionContext();
    const sync = async (force = false) => {
      if (!active || running || AppState.currentState !== "active") return;
      running = true;
      try {
        void flushRevocations().catch(() => {});
        if (role === "customer" && (force || queuedToken || Date.now() - lastSync >= 300000)) {
          const token = queuedToken;
          queuedToken = undefined;
          await syncPushDevice(session, token);
          lastSync = Date.now();
        }
      } catch {
        // Retry on foreground or on the next active interval.
      } finally {
        running = false;
        if (queuedToken && active) void sync();
      }
    };
    if (role !== "customer") void clearPushBinding().catch(() => {});
    const app = AppState.addEventListener("change", state => { if (state === "active") void sync(true); });
    const token = role === "customer" ? Notifications.addPushTokenListener(value => {
      if (typeof value.data === "string") {
        queuedToken = value.data;
        void sync();
      }
    }) : null;
    const retry = setInterval(sync, 30000);
    void sync(true);
    return () => {
      active = false;
      app.remove();
      token?.remove();
      clearInterval(retry);
    };
  }, [hydrated, role, version]);

  useEffect(() => {
    const request = response?.notification?.request;
    if (!hydrated || !navigationKey || !request?.identifier.startsWith("plantify-") ||
        handled.current === request.identifier) return;
    const data = request.content.data;
    const session = getSessionContext();
    handled.current = request.identifier;
    Notifications.clearLastNotificationResponse();
    if (role !== "customer" || !/^[a-f0-9]{24}$/i.test(data?.notificationId ?? "")) return;

    async function open() {
      if (!(await isCurrentPushBinding(data.bindingId, session.userId)) || !isSessionCurrent(session)) return;
      try {
        const { data: item } = await notificationService.detail(data.notificationId, session);
        await notificationService.markRead(data.notificationId, session);
        if (isSessionCurrent(session)) router.push(notificationRoute(item));
      } catch {
        if (isSessionCurrent(session)) router.push("/customer/notifications");
      }
    }
    void open().catch(() => {});
  }, [hydrated, navigationKey, response, role, router]);
}
