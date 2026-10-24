// RegisterForm.js - Khối giao diện RegisterForm.

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
        {/* Full Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Họ và tên</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Nhập họ và tên"
              placeholderTextColor={colors.textMuted}
              value={fullName}
              editable={!loading}
              onChangeText={(val) => {
                onChange("fullName", val);
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
                onChange("email", val);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>
        </View>

        {/* Phone Number (Không bắt buộc) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Số điện thoại{" "}
            <Text style={styles.optionalText}>(Không bắt buộc)</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Nhập số điện thoại"
              placeholderTextColor={colors.textMuted}
              value={phone}
              onChangeText={(val) => {
                onChange("phone", val);
              }}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>
        </View>

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
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
            {agreeTerms && (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            )}
          </View>
          <Text style={styles.termsText}>
            Tôi đồng ý với{" "}
            <Text style={styles.termsHighlight}>Điều khoản dịch vụ</Text> và{" "}
            <Text style={styles.termsHighlight}>Chính sách bảo mật</Text>.
          </Text>
        </TouchableOpacity>

        {/* Button: Create Account */}
        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={onSubmit}
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
                Đang gửi mã xác thực...
              </Text>
            </View>
          ) : (
            <Text style={styles.primaryButtonText}>Đăng ký</Text>
          )}
        </TouchableOpacity>

        {/* Footer Link */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            Bạn đã có tài khoản?{" "}
            <Text style={styles.linkText} onPress={() => onLogin()}>
              Đăng nhập
            </Text>
          </Text>
        </View>
      </View>
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
});
