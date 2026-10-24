import { View, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import FormField from "../common/FormField";
import PasswordField from "../common/PasswordField";
import { colors } from "../../theme/colors";
import { spacing, typography } from "../../theme/tokens";

const FIELDS = [
  { key: "fullName", label: "Họ và tên", maxLength: 100 },
  { key: "email", label: "Địa chỉ email", keyboardType: "email-address", maxLength: 254 },
  { key: "phone", label: "Số điện thoại", keyboardType: "phone-pad", maxLength: 10 },
  { key: "currentPassword", label: "Mật khẩu hiện tại", secureTextEntry: true },
  { key: "newPassword", label: "Mật khẩu mới (bỏ trống để giữ nguyên)", secureTextEntry: true },
  { key: "confirmPassword", label: "Nhập lại mật khẩu mới", secureTextEntry: true },
];

// Hiển thị bản nháp; hook xử lý lưu/hủy.
export default function ProfileEditForm({ form, changeField, saving, cancelEditing, saveProfile }) {
  return (
    <View style={styles.editForm}>
      {FIELDS.map(({ key, secureTextEntry, ...props }) => {
        const Field = secureTextEntry ? PasswordField : FormField;
        const change = (value) => changeField(key, value);
        return (
          <Field
            key={key}
            {...props}
            value={form[key]}
            disabled={saving}
            autoCapitalize={key === "fullName" ? "words" : "none"}
            autoCorrect={false}
            {...(secureTextEntry ? { onChange: change } : { onChangeText: change })}
          />
        );
      })}
      <Text style={styles.fieldLabel}>
        Nhập mật khẩu hiện tại nếu đổi email hoặc mật khẩu. Mật khẩu mới tối thiểu 8 ký tự.
      </Text>
      <View style={styles.formActions}>
        <Button disabled={saving} onPress={cancelEditing}>Hủy</Button>
        <Button mode="contained" loading={saving} disabled={saving} onPress={saveProfile}>
          Lưu thay đổi
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  editForm: { paddingVertical: spacing.md },
  formActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  fieldLabel: { ...typography.caption, color: colors.primaryText },
});
