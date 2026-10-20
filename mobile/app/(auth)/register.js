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
import useAuthStore from "../../store/authStore";

export default function RegisterScreen() {
  const router = useRouter();
  const setAuthSession = useAuthStore((state) => state.setAuthSession);

  // Buoc: 1 = Nhap thong tin dang ky, 2 = Chi chuyen khi gui OTP thanh cong
  const [step, setStep] = useState(1);

  // Form thong tin
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP state (6 o vuong)
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const otpInputs = useRef([]);

  // Loading & Error
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Countdown cho resend OTP
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Xu ly gui OTP dang ky (Buoc 1 -> Buoc 2)
  const handleSendOTP = async () => {
    setErrorMsg("");

    if (!fullName.trim()) {
      setErrorMsg("Vui lòng nhập họ và tên.");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Vui lòng nhập địa chỉ email.");
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg("Email không đúng định dạng.");
      return;
    }
    if (!password || password.length < 8) {
      setErrorMsg("Mật khẩu phải có tối thiểu 8 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (!agreeTerms) {
      setErrorMsg("Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách.");
      return;
    }

    try {
      setLoading(true);
      const res = await authService.sendRegisterOTP({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone ? phone.trim() : "",
      });

      // CHI CHUYEN SANG BUOC 2 KHI REQUEST GUI OTP THANH CONG
      if (res && res.success) {
        setErrorMsg("");
        setCountdown(60);
        setOtp(["", "", "", "", "", ""]);
        setStep(2); // <- Chuyen man hinh Verify Your Email o day
      } else {
        setErrorMsg(res?.message || "Không thể gửi mã OTP. Vui lòng thử lại.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Gửi mã OTP thất bại. Vui lòng thử lại.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Gui lai ma OTP khi dang o Buoc 2
  const handleResendOTP = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await authService.sendRegisterOTP({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone ? phone.trim() : "",
      });

      if (res && res.success) {
        setCountdown(60);
        setOtp(["", "", "", "", "", ""]);
        Alert.alert("Thành công", "Mã OTP mới đã được gửi lại tới email của bạn.");
      } else {
        setErrorMsg(res?.message || "Không thể gửi lại mã OTP.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Gửi lại OTP thất bại.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Xu ly nhap OTP 6 o vuong
  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tu dong chuyen con tro sang o tiep theo
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  // Xu ly xac thuc OTP va tao tai khoan (Buoc 2)
  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setErrorMsg("Vui lòng nhập đủ 6 chữ số mã OTP");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      const res = await authService.verifyRegisterOTP({
        email: email.trim(),
        otp: otpCode,
      });

      const { user, token } = res.data;
      await setAuthSession(user, token);

      Alert.alert("Thành công", "Chào mừng bạn gia nhập Plantify!", [
        { text: "Khám phá ngay", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Mã OTP không chính xác";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => (step === 2 ? setStep(1) : router.back())}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Error Banner */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {step === 1 ? (
            //Form đăng kí
            <View>
              <View style={styles.headerTitleContainer}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>THAM GIA PLANTIFY</Text>
                </View>
                <Text style={styles.title}>Tạo tài khoản mới</Text>
                <Text style={styles.subtitle}>Điền thông tin của bạn để bắt đầu.</Text>
              </View>

              <View style={styles.form}>
                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Họ và tên</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập họ và tên"
                      placeholderTextColor={colors.textMuted}
                      value={fullName}
                      onChangeText={(val) => {
                        setFullName(val);
                        setErrorMsg("");
                      }}
                    />
                  </View>
                </View>

                {/* Email Address */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Địa chỉ email</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập địa chỉ email"
                      placeholderTextColor={colors.textMuted}
                      value={email}
                      onChangeText={(val) => {
                        setEmail(val);
                        setErrorMsg("");
                      }}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                {/* Phone Number (Không bắt buộc) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Số điện thoại <Text style={styles.optionalText}>(Không bắt buộc)</Text>
                  </Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập số điện thoại"
                      placeholderTextColor={colors.textMuted}
                      value={phone}
                      onChangeText={(val) => {
                        setPhone(val);
                        setErrorMsg("");
                      }}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mật khẩu</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Tạo mật khẩu"
                      placeholderTextColor={colors.textMuted}
                      value={password}
                      onChangeText={(val) => {
                        setPassword(val);
                        setErrorMsg("");
                      }}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.helperText}>Sử dụng ít nhất 8 ký tự</Text>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Xác nhận mật khẩu</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập lại mật khẩu"
                      placeholderTextColor={colors.textMuted}
                      value={confirmPassword}
                      onChangeText={(val) => {
                        setConfirmPassword(val);
                        setErrorMsg("");
                      }}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Agree to Terms Checkbox */}
                <TouchableOpacity
                  style={styles.termsRow}
                  onPress={() => setAgreeTerms(!agreeTerms)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
                    {agreeTerms && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.termsText}>
                    Tôi đồng ý với <Text style={styles.termsHighlight}>Điều khoản dịch vụ</Text> và{" "}
                    <Text style={styles.termsHighlight}>Chính sách bảo mật</Text>.
                  </Text>
                </TouchableOpacity>

                {/* Button: Create Account */}
                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.buttonDisabled]}
                  onPress={handleSendOTP}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <View style={styles.buttonLoadingRow}>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={[styles.primaryButtonText, { marginLeft: 10 }]}>Đang gửi OTP...</Text>
                    </View>
                  ) : (
                    <Text style={styles.primaryButtonText}>Đăng ký</Text>
                  )}
                </TouchableOpacity>

                {/* Footer Link */}
                <View style={styles.footerContainer}>
                  <Text style={styles.footerText}>
                    Bạn đã có tài khoản?{" "}
                    <Text
                      style={styles.linkText}
                      onPress={() => router.push("/(auth)/login")}
                    >
                      Đăng nhập
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            //Nhập mã OTP
            <View>
              <View style={styles.headerTitleContainer}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>BƯỚC 2: XÁC THỰC</Text>
                </View>
                <Text style={styles.title}>Xác thực email</Text>
                <Text style={styles.subtitle}>
                  Mã xác thực gồm 6 chữ số đã được gửi đến{"\n"}
                  <Text style={{ fontWeight: "700", color: colors.textPrimary }}>{email}</Text>
                </Text>
              </View>

              {/* 6 Square OTP Inputs */}
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (otpInputs.current[index] = ref)}
                    style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(val) => handleOtpChange(val, index)}
                    onKeyPress={(e) => handleOtpKeyPress(e, index)}
                    selectTextOnFocus
                  />
                ))}
              </View>

              {/* Resend Timer */}
              <View style={styles.resendContainer}>
                {countdown > 0 ? (
                  <Text style={styles.resendTimerText}>
                    Gửi lại sau <Text style={{ fontWeight: "700" }}>00:{countdown < 10 ? `0${countdown}` : countdown}</Text>
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
                    <Text style={styles.resendActionText}>Gửi lại mã</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleVerifyOTP}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <View style={styles.buttonLoadingRow}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={[styles.primaryButtonText, { marginLeft: 10 }]}>Đang xác thực...</Text>
                  </View>
                ) : (
                  <Text style={styles.primaryButtonText}>Xác nhận và kích hoạt tài khoản</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 32,
  },
  topBar: {
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
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
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  optionalText: {
    fontSize: 12,
    fontWeight: "400",
    color: colors.textMuted,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    height: 50,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  eyeButton: {
    padding: 6,
  },
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.2,
    borderColor: "#D1D5DB",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  termsHighlight: {
    color: colors.primary,
    fontWeight: "600",
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
  footerContainer: {
    alignItems: "center",
    marginTop: 12,
  },
  footerText: {
    textAlign: "center",
    fontSize: 14,
    color: colors.textSecondary,
  },
  linkText: {
    color: colors.primary,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  // OTP Styles
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 24,
  },
  otpBox: {
    width: 46,
    height: 54,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    backgroundColor: "#FFFFFF",
  },
  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: "#F4FBF7",
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  resendTimerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resendActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    textDecorationLine: "underline",
  },
});