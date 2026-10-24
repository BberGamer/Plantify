// LoginForm.js - Khối giao diện LoginForm.
import { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import PasswordField from "./PasswordField";
import LoginAlternatives from "./LoginAlternatives";
export default function LoginForm({
  email,
  password,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onForgotPassword,
  onGoogleLogin,
}) {
  const [rememberMe, setRememberMe] = useState(false);
  return (
    <View style={styles.form}>
      {/* Field: Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Địa chỉ email</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Nhập địa chỉ email"
            placeholderTextColor={colors.textMuted}
            value={email}
            editable={!isLoading}
            onChangeText={(val) => {
              onEmailChange(val);
            }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
      </View>

      {/* Field: Password */}
      <PasswordField
        label="Mật khẩu"
        placeholder="Nhập mật khẩu"
        value={password}
        onChange={onPasswordChange}
        disabled={isLoading}
      />

      {/* Remember Me & Forgot Password */}
      <View style={styles.optionRow}>
        <TouchableOpacity
          style={styles.rememberMeContainer}
          onPress={() => setRememberMe(!rememberMe)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
            {rememberMe && (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            )}
          </View>
          <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onForgotPassword()}
          activeOpacity={0.7}
        >
          <Text style={styles.forgotText}>Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>

      {/* Primary Button: Sign In */}
      <TouchableOpacity
        style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>

      {/* Divider */}
      <LoginAlternatives onGoogleLogin={onGoogleLogin} />

    </View>
  );
}
const styles = StyleSheet.create({
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
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 22,
    flexWrap: "wrap",
    gap: 12,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
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
  rememberText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  primaryButton: {
    backgroundColor: "#0D3827",
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
