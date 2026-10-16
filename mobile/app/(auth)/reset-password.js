import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "../../src/theme/colors";
import authService from "../../src/services/authService";

export default function ResetPasswordScreen() {
  const router = useRouter();

  // State nhap lieu
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const otpInputs = useRef([]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading & Error
  const [sendingCode, setSendingCode] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Kiem tra da dien du 6 so OTP chua de mo sang nhap mat khau moi
  const otpCode = otp.join("");
  const isOtpComplete = otpCode.length === 6;

  // Countdown timer cho nut gui lai ma
  useEffect(() => {
    let timer;
    if (codeSent && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [codeSent, countdown]);

  // Goi API that gui OTP dat lai mat khau qua email
  const handleSendCode = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim()) {
      setErrorMsg("Vui lòng nhập địa chỉ email của bạn.");
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg("Địa chỉ email không đúng định dạng.");
      return;
    }

    try {
      setSendingCode(true);
      const res = await authService.forgotPassword(email.trim());
      setCodeSent(true);
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      setSuccessMsg(res?.message || "Mã OTP đã được gửi đến email của bạn.");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Gửi mã OTP thất bại. Vui lòng kiểm tra lại email.";
      setErrorMsg(msg);
    } finally {
      setSendingCode(false);
    }
  };

  // Xu ly nhap 6 o vuong OTP
  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tu dong nhay con tro sang o tiep theo
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  // Goi API that de doi mat khau bang OTP
  const handleConfirmReset = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim()) {
      setErrorMsg("Vui lòng nhập địa chỉ email.");
      return;
    }
    if (!isOtpComplete) {
      setErrorMsg("Vui lòng nhập đủ 6 chữ số mã OTP xác thực.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setErrorMsg("Mật khẩu mới phải có tối thiểu 8 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setUpdatingPassword(true);
      await authService.resetPassword({
        email: email.trim(),
        otp: otpCode,
        newPassword,
      });

      Alert.alert(
        "Thành công",
        "Mật khẩu của bạn đã được cập nhật thành công! Vui lòng đăng nhập lại.",
        [
          {
            text: "Đăng nhập ngay",
            onPress: () => router.replace("/(auth)/login"),
          },
        ]
      );
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Đặt lại mật khẩu thất bại. Vui lòng kiểm tra lại mã OTP.";
      setErrorMsg(msg);
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Top Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reset Password</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title & Subtitle */}
          <View style={styles.titleContainer}>
            <Text style={styles.pageTitle}>Create a new password</Text>
            <Text style={styles.pageSubtitle}>
              Enter your email to receive a verification code, then choose a new password.
            </Text>
          </View>

          {/* Error Message */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Success Message */}
          {successMsg ? (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          ) : null}

          {/* ================= STEP 1: VERIFY YOUR EMAIL ================= */}
          <View style={styles.section}>
            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <Text style={styles.stepTitle}>Verify your email</Text>
            </View>

            <View style={styles.emailRow}>
              <TextInput
                style={styles.emailInput}
                placeholder="Email address"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TouchableOpacity
                style={[
                  styles.sendCodeButton,
                  sendingCode && styles.sendCodeButtonDisabled,
                ]}
                onPress={handleSendCode}
                disabled={sendingCode}
                activeOpacity={0.8}
              >
                {sendingCode ? (
                  <ActivityIndicator size="small" color="#111827" />
                ) : (
                  <Text style={styles.sendCodeText}>Send Code</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* ================= STEP 2: ENTER VERIFICATION CODE ================= */}
          <View style={styles.section}>
            <View style={styles.stepHeader}>
              <View
                style={[
                  styles.stepBadge,
                  !codeSent && { backgroundColor: "#9CA3AF" },
                ]}
              >
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <Text style={styles.stepTitle}>Enter verification code</Text>
            </View>

            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (otpInputs.current[index] = ref)}
                  style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : null,
                    !codeSent && styles.otpBoxDisabled,
                  ]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(val, index)}
                  onKeyPress={(e) => handleOtpKeyPress(e, index)}
                  selectTextOnFocus
                  editable={codeSent}
                />
              ))}
            </View>

            {codeSent && (
              <View style={styles.resendRow}>
                {countdown > 0 ? (
                  <Text style={styles.resendTimer}>
                    Resend in{" "}
                    <Text style={{ fontWeight: "700" }}>
                      00:{countdown < 10 ? `0${countdown}` : countdown}
                    </Text>
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleSendCode} disabled={sendingCode}>
                    <Text style={styles.resendAction}>Resend Code</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* ================= STEP 3: SET NEW PASSWORD ================= */}
          {/* CHI MO SANG KHI DIEN DU 6 SO OTP */}
          <View style={styles.section}>
            <View style={styles.stepHeader}>
              <View
                style={[
                  styles.stepBadge,
                  !isOtpComplete && styles.stepBadgeDisabled,
                ]}
              >
                <Text style={styles.stepBadgeText}>3</Text>
              </View>
              <Text
                style={[
                  styles.stepTitle,
                  !isOtpComplete && { color: colors.textMuted },
                ]}
              >
                Set new password
              </Text>
            </View>

            {/* Hint thong bao trang thai */}
            {!isOtpComplete ? (
              <View style={styles.lockHintBox}>
                <Ionicons name="lock-closed-outline" size={15} color={colors.textMuted} />
                <Text style={styles.lockHintText}>
                  Nhập đủ 6 số mã OTP ở bước 2 để mở khóa tạo mật khẩu mới.
                </Text>
              </View>
            ) : null}

            {/* New Password */}
            <View style={styles.passwordGroup}>
              <Text
                style={[
                  styles.inputLabel,
                  !isOtpComplete && { color: colors.textMuted },
                ]}
              >
                New Password
              </Text>
              <View
                style={[
                  styles.passwordWrapper,
                  !isOtpComplete ? styles.inputWrapperDisabled : styles.inputWrapperActive,
                ]}
              >
                <TextInput
                  style={[
                    styles.passwordInput,
                    !isOtpComplete && { color: colors.textMuted },
                  ]}
                  placeholder="Enter new password"
                  placeholderTextColor={colors.textMuted}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  editable={isOtpComplete}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeBtn}
                  disabled={!isOtpComplete}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={isOtpComplete ? colors.textSecondary : "#D1D5DB"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm New Password */}
            <View style={styles.passwordGroup}>
              <Text
                style={[
                  styles.inputLabel,
                  !isOtpComplete && { color: colors.textMuted },
                ]}
              >
                Confirm New Password
              </Text>
              <View
                style={[
                  styles.passwordWrapper,
                  !isOtpComplete ? styles.inputWrapperDisabled : styles.inputWrapperActive,
                ]}
              >
                <TextInput
                  style={[
                    styles.passwordInput,
                    !isOtpComplete && { color: colors.textMuted },
                  ]}
                  placeholder="Enter confirm new password"
                  placeholderTextColor={colors.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={isOtpComplete}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeBtn}
                  disabled={!isOtpComplete}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={isOtpComplete ? colors.textSecondary : "#D1D5DB"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!isOtpComplete || updatingPassword) && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirmReset}
            disabled={!isOtpComplete || updatingPassword}
            activeOpacity={0.85}
          >
            {updatingPassword ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm & Update Password</Text>
            )}
          </TouchableOpacity>
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
  stepBadgeDisabled: {
    backgroundColor: "#9CA3AF",
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
  emailRow: {
    flexDirection: "row",
    gap: 10,
  },
  emailInput: {
    flex: 1,
    height: 48,
    borderWidth: 1.2,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: "#FFFFFF",
  },
  sendCodeButton: {
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1.2,
    borderColor: "#111827",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  sendCodeButtonDisabled: {
    opacity: 0.6,
  },
  sendCodeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  otpBox: {
    width: 44,
    height: 50,
    borderWidth: 1.2,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    backgroundColor: "#FFFFFF",
  },
  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: "#F4FBF7",
  },
  otpBoxDisabled: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },
  resendRow: {
    alignItems: "center",
    marginTop: 10,
  },
  resendTimer: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  resendAction: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    textDecorationLine: "underline",
  },
  lockHintBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 12,
    gap: 6,
  },
  lockHintText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  passwordGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.2,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 14,
  },
  inputWrapperActive: {
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  inputWrapperDisabled: {
    borderColor: "#E5E7EB",
    backgroundColor: "#F3F4F6",
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  eyeBtn: {
    padding: 6,
  },
  confirmButton: {
    backgroundColor: "#0D3827",
    height: 52,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  confirmButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});