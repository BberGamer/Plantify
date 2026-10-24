// RegisterForm.js - Khối giao diện RegisterForm.

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
export default function RegisterForm({
  form,
  loading,
  onChange,
  onSubmit,
  onLogin,
}) {
  const { fullName, email, phone, password, confirmPassword, agreeTerms } =
    form;
  return (
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
        <FormField
          label="Họ và tên"
          placeholder="Nhập họ và tên"
          value={fullName}
          disabled={loading}
          onChangeText={(value) => onChange("fullName", value)}
          autoCapitalize="words"
        />

        <FormField
          label="Địa chỉ email"
          placeholder="Nhập địa chỉ email"
          value={email}
          disabled={loading}
          onChangeText={(value) => onChange("email", value)}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />

        <FormField
          label="Số điện thoại (không bắt buộc)"
          placeholder="Nhập số điện thoại"
          value={phone}
          disabled={loading}
          onChangeText={(value) => onChange("phone", value)}
          keyboardType="phone-pad"
        />

        {/* Password */}
        <PasswordField
          label="Mật khẩu"
          placeholder="Tạo mật khẩu"
          value={password}
          onChange={(value) => onChange("password", value)}
          disabled={loading}
          hint="Sử dụng ít nhất 8 ký tự"
        />

        {/* Confirm Password */}
        <PasswordField
          label="Xác nhận mật khẩu"
          placeholder="Nhập lại mật khẩu"
          value={confirmPassword}
          onChange={(value) => onChange("confirmPassword", value)}
          disabled={loading}
        />

        {/* Agree to Terms Checkbox */}
        <TouchableOpacity
          style={styles.termsRow}
          disabled={loading}
          onPress={() => onChange("agreeTerms", !agreeTerms)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreeTerms, disabled: loading }}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
            {agreeTerms && (
              <Ionicons name="checkmark" size={14} color={colors.white} />
            )}
          </View>
          <Text style={styles.termsText}>
            Tôi đồng ý với{" "}
            <Text style={styles.termsHighlight}>Điều khoản dịch vụ</Text> và{" "}
            <Text style={styles.termsHighlight}>Chính sách bảo mật</Text>.
          </Text>
        </TouchableOpacity>

        {/* Button: Create Account */}
        <Button mode="contained" style={styles.submit} contentStyle={{ minHeight: control.minHeight }} loading={loading} disabled={loading} onPress={onSubmit}>
          Đăng ký
        </Button>

        {/* Footer Link */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            Bạn đã có tài khoản?{" "}
            <Text style={styles.linkText} accessibilityRole="link"
              accessibilityState={{ disabled: loading }}
              onPress={() => { if (!loading) onLogin(); }}>
              Đăng nhập
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  submit: { marginTop: spacing.sm, marginBottom: spacing.xl },
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
  form: {
    width: "100%",
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.lg,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
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
  footerContainer: {
    alignItems: "center",
    marginTop: spacing.md,
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
});
