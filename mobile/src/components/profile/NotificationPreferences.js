import { componentStyles } from "../../theme/componentStyles";
import { Button, Switch, Text } from "react-native-paper";
import ProfileInfoRow from "./ProfileInfoRow";
import useNotificationPreferences from "../../hooks/useNotificationPreferences";

export default function NotificationPreferences({ disabled }) {
  const { enabled, busy, error, refresh, update } =
    useNotificationPreferences();
  return (
    <>
      <ProfileInfoRow
        icon="notifications-outline"
        label="Nhắc điều trị"
        value={
          enabled === null
            ? error
              ? "Chưa tải được tùy chọn"
              : "Đang tải…"
            : enabled
              ? "Đang bật"
              : "Đang tắt"
        }
        last
        action={
          <Switch
            accessibilityLabel="Nhắc điều trị"
            value={enabled === true}
            disabled={disabled || busy || enabled === null}
            onValueChange={update}
          />
        }
      />
      {!!error && <Text accessibilityRole="alert">{error}</Text>}
      {!!error && enabled === null && (
        <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} disabled={disabled || busy} onPress={refresh}>
          Thử lại
        </Button>
      )}
    </>
  );
}
