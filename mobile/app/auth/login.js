// login.js - Ghép giao diện đăng nhập và hook điều phối.

import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme/colors";
import useLogin from "../../src/hooks/useLogin";
import LoginForm from "../../src/components/auth/LoginForm";
import AccountLockedDialog from "../../src/components/auth/AccountLockedDialog";
export default function LoginScreen() {
  const login = useLogin();
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
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="leaf" size={28} color={colors.primary} />
            </View>
            <Text style={styles.brandTitle}>Plantify</Text>
          </View>
          <View style={styles.headingContainer}>
            <Text style={styles.title}>Chào mừng trở lại</Text>
            <Text style={styles.subtitle}>
              Đăng nhập để tiếp tục sử dụng tài khoản
            </Text>
          </View>
          {!!login.error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText} accessibilityRole="alert">
                {login.error}
              </Text>
            </View>
          )}
          <LoginForm
            email={login.email}
            password={login.password}
            isLoading={login.isLoading}
            fieldErrors={login.fieldErrors}
            onEmailChange={login.changeEmail}
            onPasswordChange={login.changePassword}
            onSubmit={login.submit}
            onForgotPassword={login.forgotPassword}
            onGoogleLogin={login.googleLogin}
          />
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Bạn chưa có tài khoản?{" "}
              <Text style={styles.registerLink} onPress={login.register}>
                Đăng ký ngay
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <AccountLockedDialog visible={login.accountLocked} onDismiss={login.dismissAccountLocked} />
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    justifyContent: "center"
  },
  logoContainer: {
    alignItems: "flex-start",
    marginTop: 16,
    marginBottom: 32
  },
  logoCircle: {
    width: 62,
    height: 62,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.softSproutBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: -0.3
  },
  headingContainer: {
    alignItems: "flex-start",
    marginBottom: 26
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6
  },
  subtitle: {
    textAlign: "left",
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary
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
  },
  footerContainer: {
    alignItems: "center",
    marginTop: 28
  },
  footerText: {
    textAlign: "center",
    fontSize: 14,
    color: colors.textSecondary
  },
  registerLink: {
    color: colors.primary,
    fontWeight: "700",
    textDecorationLine: "underline"
  }
});
