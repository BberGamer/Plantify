// RegisterOtpForm.js - Khối giao diện RegisterOtpForm.

import {
  View,
  StyleSheet,
} from "react-native";
import { Button, Text } from "react-native-paper";
import { control, spacing } from "../../theme/tokens";
import { colors } from "../../theme/colors";
import OtpInput from "./OtpInput";
import OtpResend from "./OtpResend";
export default function RegisterOtpForm({
  email,
  otp,
  countdown,
  loading,
  onOtpChange,
  onResend,
  onVerify,
}) {
  return (
    //Nhập mã OTP
    <View>
      <View style={styles.headerTitleContainer}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>BƯỚC 2: XÁC THỰC</Text>
        </View>
        <Text style={styles.title}>Xác thực email</Text>
        <Text style={styles.subtitle}>
          Mã xác thực gồm 6 chữ số đã được gửi đến{"\n"}
          <Text
            style={{
              fontWeight: "700",
              color: colors.textPrimary,
            }}
          >
            {email}
          </Text>
        </Text>
      </View>

      {/* 6 Square OTP Inputs */}
      <OtpInput value={otp} onChange={onOtpChange} disabled={loading} />

      {/* Resend Timer */}
      <OtpResend countdown={countdown} disabled={loading} onResend={onResend} />

      {/* Verify Button */}
      <Button mode="contained" style={styles.submit} contentStyle={{ minHeight: control.minHeight }} onPress={onVerify} disabled={loading} loading={loading}>
          Xác nhận và kích hoạt tài khoản
      </Button>
    </View>
  );
}
const styles = StyleSheet.create({
  submit: { marginTop: spacing.md, marginBottom: spacing.xl },
  headerTitleContainer: {
    marginBottom: spacing.xxl,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.lightMint,
    paddingHorizontal: 10,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    marginBottom: spacing.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },

});
