// ResetPasswordForm.js - Khối giao diện ResetPasswordForm.

import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import PasswordField from "./PasswordField";
export default function ResetPasswordForm({
  newPassword,
  confirmPassword,
  isOtpComplete,
  busy,
  updatingPassword,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}) {
  return (
    <>
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
              !isOtpComplete && {
                color: colors.textMuted,
              },
            ]}
          >
            Đặt mật khẩu mới
          </Text>
        </View>

        {/* Hint thong bao trang thai */}
        {!isOtpComplete ? (
          <View style={styles.lockHintBox}>
            <Ionicons
              name="lock-closed-outline"
              size={15}
              color={colors.textMuted}
            />
            <Text style={styles.lockHintText}>
              Nhập đủ 6 số mã xác thực ở bước 2 để mở khóa tạo mật khẩu mới.
            </Text>
          </View>
        ) : null}

        {/* New Password */}
        <PasswordField
          label="Mật khẩu mới"
          placeholder="Nhập mật khẩu mới"
          value={newPassword}
          onChange={onNewPasswordChange}
          disabled={!isOtpComplete || busy}
        />

        {/* Confirm New Password */}
        <PasswordField
          label="Xác nhận mật khẩu mới"
          placeholder="Nhập lại mật khẩu mới"
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
          disabled={!isOtpComplete || busy}
        />
      </View>
      <TouchableOpacity
        style={[
          styles.confirmButton,
          (!isOtpComplete || busy) && styles.confirmButtonDisabled,
        ]}
        onPress={onSubmit}
        disabled={!isOtpComplete || busy}
        activeOpacity={0.85}
      >
        {updatingPassword ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.confirmButtonText}>
            Xác nhận đổi mật khẩu
          </Text>
        )}
      </TouchableOpacity>
    </>
  );
}
const styles = StyleSheet.create({
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
