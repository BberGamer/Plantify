import { useState } from "react";
import { Button, Switch, Text } from "react-native-paper";
import ProfileInfoRow from "./ProfileInfoRow";
import useScreenScope from "../../hooks/useScreenScope";
import notificationService from "../../services/notificationService";
import getErrorMessage from "../../utils/getErrorMessage";

export default function NotificationPreferences({ disabled }) {
  const [enabled, setEnabled] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const scope = useScreenScope(() => void load(), () => setEnabled(null));

  async function load(next) {
    const current = scope.capture();
    setBusy(true);
    setError("");
    try {
      const response = typeof next === "boolean"
        ? await notificationService.updatePreferences(next)
        : await notificationService.preferences();
      const value = response?.data?.treatment_reminders;
      if (response?.success !== true || typeof value !== "boolean")
        throw Object.assign(new Error("Invalid response"), { code: "INVALID_RESPONSE" });
      if (current()) setEnabled(value);
    } catch (failure) {
      if (current()) setError(getErrorMessage(failure, "Không thể cập nhật tùy chọn thông báo."));
    } finally {
      if (current()) setBusy(false);
    }
  }

  return <>
    <ProfileInfoRow icon="notifications-outline" label="Nhắc điều trị"
      value={enabled === null ? (error ? "Chưa tải được tùy chọn" : "Đang tải…") : enabled ? "Đang bật" : "Đang tắt"}
      last
      action={<Switch accessibilityLabel="Nhắc điều trị" value={enabled === true}
        disabled={disabled || busy || enabled === null} onValueChange={load} />} />
    {!!error && <Text accessibilityRole="alert">{error}</Text>}
    {!!error && enabled === null && <Button disabled={disabled || busy} onPress={() => load()}>Thử lại</Button>}
  </>;
}
