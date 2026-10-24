import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, TextInput } from "react-native-paper";
import { colors } from "../../theme/colors";
import { profileTheme } from "./profileTheme";

// Hiển thị bản nháp; hook xử lý lưu/hủy.
export default function ProfileEditForm({ form, setForm, saving, cancelEditing, saveProfile }) {
  return (
            <View style={styles.editForm}>
              {/* Dùng cấu hình mảng để ba ô cơ bản có cùng giao diện, ít lặp code. */}
              {[
                { key: "fullName", label: "Họ và tên", maxLength: 100 },
                {
                  key: "email",
                  label: "Email",
                  keyboardType: "email-address",
                  maxLength: 254,
                },
                {
                  key: "phone",
                  label: "Số điện thoại",
                  keyboardType: "phone-pad",
                  maxLength: 10,
                },
                
                      {
                        key: "currentPassword",
                        label: "Mật khẩu hiện tại",
                        secureTextEntry: true,
                      },
                      {
                        key: "newPassword",
                        label: "Mật khẩu mới (bỏ trống để giữ nguyên)",
                        secureTextEntry: true,
                      },
                      {
                        key: "confirmPassword",
                        label: "Nhập lại mật khẩu mới",
                        secureTextEntry: true,
                      },
              ].map(({ key, ...props }) => (
                <TextInput
                  key={key}
                  mode="outlined"
                  {...props}
                  theme={profileTheme}
                  value={form[key]}
                  editable={!saving && !props.disabled}
                  autoCapitalize={key === "fullName" ? "words" : "none"}
                  autoCorrect={false}
                  style={styles.input}
                  onChangeText={(value) =>
                    setForm((previous) => ({ ...previous, [key]: value }))
                  }
                />
              ))}
              <Text style={styles.fieldLabel}>
                
                  Nhập mật khẩu hiện tại nếu đổi email hoặc mật khẩu. Mật khẩu mới tối thiểu 8 ký tự.
              </Text>
              <View style={styles.formActions}>
                <Button theme={profileTheme} disabled={saving} onPress={cancelEditing}>
                  Hủy
                </Button>
                <Button
                  mode="contained"
                  theme={profileTheme}
                  style={styles.saveButton}
                  loading={saving}
                  disabled={saving}
                  onPress={saveProfile}
                >
                  Lưu thay đổi
                </Button>
              </View>
            </View>
  );
}

// Style riêng của component.
const styles = StyleSheet.create({
saveButton: { backgroundColor: colors.primary },
editForm: { paddingVertical: 12 },
input: { marginBottom: 12, backgroundColor: colors.white },
formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    gap: 8,
  },
fieldLabel: { fontSize: 12, color: colors.primaryText }
});
