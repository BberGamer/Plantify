// RegisterOtpForm.js - Khối giao diện RegisterOtpForm.

import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native-paper";
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
      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={onVerify}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <View style={styles.buttonLoadingRow}>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text
              style={[
                styles.primaryButtonText,
                {
                  marginLeft: 10,
                },
              ]}
            >
              Đang xác thực...
            </Text>
          </View>
        ) : (
          <Text style={styles.primaryButtonText}>
            Xác nhận và kích hoạt tài khoản
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  headerTitleContainer: {
    marginBottom: 24,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#EDF7F1",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
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
  primaryButton: {
    backgroundColor: "#0D3827",
    height: 52,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
