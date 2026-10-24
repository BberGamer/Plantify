import { control, spacing } from "../../theme/tokens";
// OtpResend.js - Hiển thị thời gian chờ và nút gửi lại OTP.

import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { colors } from "../../theme/colors";

export default function OtpResend({ countdown, disabled, onResend }) {
  return (
    <View style={styles.row}>
      {countdown > 0 ? (
        <Text style={styles.timer}>
          Gửi lại sau 00:{String(countdown).padStart(2, "0")}
        </Text>
      ) : (
        <TouchableOpacity
          onPress={onResend}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityState={{ disabled: Boolean(disabled) }}
          style={styles.touch}
        >
          <Text style={[styles.action, disabled && styles.disabled]}>
            Gửi lại mã
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  touch: { minHeight: control.touchSize, justifyContent: "center" },
  row: { alignItems: "center", marginVertical: spacing.md },
  timer: { color: colors.textSecondary, fontSize: 13 },
  action: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  disabled: { opacity: 0.5 },
});
