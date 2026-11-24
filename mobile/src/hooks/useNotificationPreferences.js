import { useState } from "react";
import useScreenScope from "./useScreenScope";
import notificationService from "../services/notificationService";
import getErrorMessage from "../utils/getErrorMessage";

export default function useNotificationPreferences() {
  const [enabled, setEnabled] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const scope = useScreenScope(
    () => void load(),
    () => setEnabled(null),
  );

  async function load(next) {
    const current = scope.capture();
    setBusy(true);
    setError("");
    try {
      const response =
        typeof next === "boolean"
          ? await notificationService.updatePreferences(next)
          : await notificationService.preferences();
      const value = response?.data?.treatment_reminders;
      if (response?.success !== true || typeof value !== "boolean")
        throw Object.assign(new Error("Invalid response"), {
          code: "INVALID_RESPONSE",
        });
      if (current()) setEnabled(value);
    } catch (failure) {
      if (current())
        setError(
          getErrorMessage(failure, "Không thể cập nhật tùy chọn thông báo."),
        );
    } finally {
      if (current()) setBusy(false);
    }
  }

  return { enabled, busy, error, refresh: () => load(), update: load };
}
