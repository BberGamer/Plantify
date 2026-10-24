// LoginForm.js - Khối giao diện LoginForm.
import { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Button, Text } from "react-native-paper";
import FormField from "../common/FormField";
import { control, spacing } from "../../theme/tokens";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import PasswordField from "../common/PasswordField";
import LoginAlternatives from "./LoginAlternatives";
export default function LoginForm({
  email,
  password,
  isLoading,
  fieldErrors = {},
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
      <FormField
        label="Địa chỉ email"
        error={fieldErrors.email}
        placeholder="Nhập địa chỉ email"
        placeholderTextColor={colors.textMuted}
        value={email}
        disabled={isLoading}
        onChangeText={(val) => {
          onEmailChange(val);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />

      {/* Field: Password */}
      <PasswordField
        label="Mật khẩu"
        error={fieldErrors.password}
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
          disabled={isLoading}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: rememberMe, disabled: isLoading }}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
            {rememberMe && (
              <Ionicons name="checkmark" size={14} color={colors.white} />
            )}
          </View>
          <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onForgotPassword()}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Text style={styles.forgotText}>Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>

      {/* Primary Button: Sign In */}
      <Button
        mode="contained"
        style={styles.submit}
        contentStyle={{ minHeight: control.minHeight }}
        loading={isLoading}
        onPress={onSubmit}
        disabled={isLoading}
      >
        Đăng nhập
      </Button>

      {/* Divider */}
      <LoginAlternatives onGoogleLogin={onGoogleLogin} disabled={isLoading} />

    </View>
  );
}
const styles = StyleSheet.create({
  submit: { marginBottom: spacing.xl },
  form: {
    width: "100%",
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
    marginBottom: 22,
    flexWrap: "wrap",
    gap: spacing.md,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.2,
    borderColor: colors.inputBorder,
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

});
