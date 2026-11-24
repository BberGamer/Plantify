// register.js - Ghép giao diện đăng ký và xác thực email.
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
import { useRouter } from "expo-router";
import useRegister from "../../src/hooks/useRegister";
import useFormBack from "../../src/hooks/useFormBack";
import RegisterForm from "../../src/components/auth/RegisterForm";
import RegisterOtpForm from "../../src/components/auth/RegisterOtpForm";
export default function RegisterScreen() {
  const registration = useRegister();
  useFormBack(registration.goBack, registration.loading);
  const router = useRouter();
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
          <View style={styles.topBar}>
          </View>
          {!!registration.errorMsg && (
            <View style={styles.errorBox}>
              <Text accessibilityRole="alert" style={styles.errorText}>
                {registration.errorMsg}
              </Text>
            </View>
          )}
          {!!registration.successMsg && (
            <Text accessibilityRole="alert">{registration.successMsg}</Text>
          )}
          {registration.step === 1 ? (
            <RegisterForm
              form={registration.form}
              loading={registration.loading}
              onChange={registration.changeField}
              onSubmit={registration.sendOTP}
              onLogin={() => router.push("/auth/login")}
            />
          ) : (
            <RegisterOtpForm
              email={registration.form.email}
              otp={registration.otp}
              countdown={registration.countdown}
              loading={registration.loading}
              onOtpChange={registration.changeOtp}
              onResend={registration.resendOTP}
              onVerify={registration.verifyOTP}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  keyboardView: {
    flex: 1
  },
  scrollContent: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingTop: 24,
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32
  },
  topBar: {
    paddingVertical: 12
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.errorBackground,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8
  },
  errorText: {
    color: colors.statusError,
    fontSize: 13,
    flex: 1
  }
});
