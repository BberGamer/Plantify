// ResetOtpForm.js - Khối giao diện ResetOtpForm.

import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { colors } from "../../theme/colors";
import OtpInput from "./OtpInput";
import OtpResend from "./OtpResend";
export default function ResetOtpForm({
  otp,
  codeSent,
  countdown,
  busy,
  onOtpChange,
  onResend,
}) {
  return (
    <View style={styles.section}>
      <View style={styles.stepHeader}>
        <View
          style={[
            styles.stepBadge,
            !codeSent && {
              backgroundColor: "#9CA3AF",
            },
          ]}
        >
          <Text style={styles.stepBadgeText}>2</Text>
        </View>
        <Text style={styles.stepTitle}>Nhập mã xác thực</Text>
      </View>

      <OtpInput
        value={otp}
        onChange={onOtpChange}
        disabled={!codeSent || busy}
      />

      {codeSent && (
        <OtpResend countdown={countdown} disabled={busy} onResend={onResend} />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  section: {
    marginBottom: 22,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
});
