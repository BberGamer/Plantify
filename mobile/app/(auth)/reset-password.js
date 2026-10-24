// reset-password.js - Ghép các bước đặt lại mật khẩu.
import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme/colors";
import useResetPassword from "../../src/hooks/useResetPassword";
import useFormBack from "../../src/hooks/useFormBack";
import ResetEmailForm from "../../src/components/auth/ResetEmailForm";
import ResetOtpForm from "../../src/components/auth/ResetOtpForm";
import ResetPasswordForm from "../../src/components/auth/ResetPasswordForm";
import ResetSuccess from "../../src/components/auth/ResetSuccess";
export default function ResetPasswordScreen() {
  const reset = useResetPassword();
  const busy = reset.sendingCode || reset.updatingPassword;
  useFormBack(reset.goBack, busy);
  if (reset.resetSuccess)
    return (
      <SafeAreaView style={styles.safeArea}>
        <ResetSuccess />
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={reset.goBack}
            disabled={busy}
            style={styles.backButton}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đặt lại mật khẩu</Text>
          <View style={styles.backButton} />
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.pageTitle}>Tạo mật khẩu mới</Text>
            <Text style={styles.pageSubtitle}>
              Nhập email để nhận mã xác thực, sau đó tạo mật khẩu mới.
            </Text>
          </View>
          {!!reset.errorMsg && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText} accessibilityRole="alert">
                {reset.errorMsg}
              </Text>
            </View>
          )}
          {!!reset.successMsg && (
            <View style={styles.successBox}>
              <Text style={styles.successText} accessibilityRole="alert">
                {reset.successMsg}
              </Text>
            </View>
          )}
          <ResetEmailForm
            email={reset.email}
            sendingCode={reset.sendingCode}
            busy={busy}
            codeSent={reset.codeSent}
            countdown={reset.countdown}
            onEmailChange={reset.changeEmail}
            onSend={reset.sendCode}
          />
          <ResetOtpForm
            otp={reset.otp}
            codeSent={reset.codeSent}
            countdown={reset.countdown}
            busy={busy}
            onOtpChange={reset.changeOtp}
            onResend={reset.sendCode}
          />
          <ResetPasswordForm
            newPassword={reset.newPassword}
            confirmPassword={reset.confirmPassword}
            isOtpComplete={reset.isOtpComplete}
            busy={busy}
            updatingPassword={reset.updatingPassword}
            onNewPasswordChange={reset.changeNewPassword}
            onConfirmPasswordChange={reset.changeConfirmPassword}
            onSubmit={reset.confirmReset}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 36,
  },
  titleContainer: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 13,
    flex: 1,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#86EFAC",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  successText: {
    color: "#15803D",
    fontSize: 13,
    flex: 1,
  },
});
