// OtpResend.js - Hiển thị thời gian chờ và nút gửi lại OTP.
import React from "react";
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
  row: { alignItems: "center", marginVertical: 12 },
  timer: { color: colors.textSecondary, fontSize: 13 },
  action: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  disabled: { opacity: 0.5 },
});
