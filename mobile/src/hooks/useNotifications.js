import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import notificationService from "../services/notificationService";
import usePaginatedList from "./usePaginatedList";
import useScreenScope from "./useScreenScope";
import getErrorMessage from "../utils/getErrorMessage";
import { getSessionContext } from "../services/sessionAccess";
import useAuthStore from "../../store/authStore";

export default function useNotifications() {
  const list = usePaginatedList(notificationService.list, { limit: 20 });
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");
  const lock = useRef(false);
  const sessionVersion = useAuthStore(state => state.sessionVersion);
  const reload = list.refresh;
  useFocusEffect(useCallback(() => notificationService.subscribe(getSessionContext(), () => {
    if (!lock.current) void reload();
  }), [reload, sessionVersion]));
  const scope = useScreenScope(() => { setBusyId(null); setActionError(""); });
  const markRead = async (item) => {
    if (lock.current) return false;
    if (item.is_read) return true;
    const current = scope.capture();
    lock.current = true;
    setBusyId(item._id);
    setActionError("");
    try {
      const response = await notificationService.markRead(item._id);
      if (response?.success !== true || response.data?._id !== item._id || response.data.is_read !== true)
        throw Object.assign(new Error("Invalid response"), { code: "INVALID_RESPONSE" });
      if (!current()) return false;
      list.setItems(items => items.map(value => value._id === item._id ? { ...value, is_read: true } : value));
      return true;
    } catch (error) {
      if (current()) setActionError(getErrorMessage(error, "Không thể đánh dấu đã đọc. Vui lòng thử lại."));
      return false;
    } finally {
      lock.current = false;
      if (current()) setBusyId(null);
    }
  };
  const refresh = () => { if (!lock.current) return list.refresh(); };
  return { ...list, refresh, busyId, actionError, markRead };
}
