// ResetPasswordForm.js - Khối giao diện ResetPasswordForm.

import {
  View,
  StyleSheet,
} from "react-native";
import { Button, Text } from "react-native-paper";
import { control, spacing, radius, typography } from "../../theme/tokens";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import PasswordField from "../common/PasswordField";
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
      <Button mode="contained" style={styles.submit} contentStyle={{ minHeight: control.minHeight }} onPress={onSubmit} disabled={!isOtpComplete || busy} loading={updatingPassword}>
          Xác nhận đổi mật khẩu
      </Button>
    </>
  );
}
const styles = StyleSheet.create({
  submit: { marginTop: spacing.md, marginBottom: spacing.xl },
  section: {
    marginBottom: 22,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: 10,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.md,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeDisabled: {
    backgroundColor: colors.textMuted,
  },
  stepBadgeText: {
    color: colors.white,
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
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    marginBottom: spacing.md,
    gap: 6,
  },
  lockHintText: {
    ...typography.caption, color: colors.textMuted,
  },

});
