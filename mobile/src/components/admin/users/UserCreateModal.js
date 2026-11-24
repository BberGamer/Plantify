import { BottomSheetFrame } from "../../common/ModalFrames";
import { componentStyles } from "../../../theme/componentStyles";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
} from "react-native";

import { Button, HelperText } from "react-native-paper";
import FormField from "../../common/FormField";
import PasswordField from "../../common/PasswordField";
import { ROLE_LABELS } from "../../../constants/roles";
import { colors } from "../../../theme/colors";

export default function UserCreateModal({
  visible,
  draft,
  errors,
  error,
  submitting,
  onClose,
  onChangeField,
  onSubmit,
}) {
  return (
    <BottomSheetFrame visible={visible} onRequestClose={onClose} style={{ maxWidth: 600, maxHeight: "92%" }}>
          <View style={styles.header}>
            <Text style={styles.title}>Thêm người dùng</Text>
            <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} onPress={onClose} disabled={submitting}>
              Đóng
            </Button>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.body}
          >
            <FormField
              label="Họ và tên *"
              value={draft.fullName}
              error={errors.fullName}
              disabled={submitting}
              onChangeText={(value) => onChangeField("fullName", value)}
            />
            <FormField
              label="Email *"
              value={draft.email}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              disabled={submitting}
              onChangeText={(value) => onChangeField("email", value)}
            />
            <FormField
              label="Số điện thoại"
              value={draft.phone}
              error={errors.phone}
              keyboardType="phone-pad"
              disabled={submitting}
              onChangeText={(value) => onChangeField("phone", value)}
            />
            <PasswordField
              label="Mật khẩu *"
              value={draft.password}
              error={errors.password}
              disabled={submitting}
              onChange={(value) => onChangeField("password", value)}
            />
            <PasswordField
              label="Xác nhận mật khẩu *"
              value={draft.confirmPassword}
              error={errors.confirmPassword}
              disabled={submitting}
              onChange={(value) => onChangeField("confirmPassword", value)}
            />
            <Text style={styles.label}>Vai trò</Text>
            <View style={styles.roles}>
              {Object.entries(ROLE_LABELS).map(([role, label]) => (
                <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
                  key={role}
                  mode={draft.role === role ? "contained" : "outlined"}
                  disabled={submitting}
                  accessibilityState={{
                    selected: draft.role === role,
                    disabled: submitting,
                  }}
                  onPress={() => onChangeField("role", role)}
                >
                  {label}
                </Button>
              ))}
            </View>
            {!!errors.role && (
              <HelperText type="error">{errors.role}</HelperText>
            )}
            <Text style={styles.hint}>
              Tài khoản mới sẽ hoạt động ngay, không cần xác thực OTP.
            </Text>
            {!!error && (
              <HelperText type="error" accessibilityRole="alert">
                {error}
              </HelperText>
            )}
          </ScrollView>
          <View style={styles.footer}>
            <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} onPress={onClose} disabled={submitting}>
              Hủy
            </Button>
            <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
              mode="contained"
              onPress={onSubmit}
              loading={submitting}
              disabled={submitting}
            >
              Thêm người dùng
            </Button>
          </View>
    </BottomSheetFrame>
  );
}

const styles = StyleSheet.create({
  
  
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    gap: 8
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary
  },
  body: {
    padding: 16
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8
  },
  roles: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 16
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border
  }
});
