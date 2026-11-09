import { Modal, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, HelperText } from "react-native-paper";
import FormField from "../../common/FormField";
import PasswordField from "../../common/PasswordField";
import { ROLE_LABELS } from "../../../constants/roles";
import { colors } from "../../../theme/colors";

export default function UserCreateModal({ visible, draft, errors, error, submitting, onClose, onChangeField, onSubmit }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <SafeAreaView edges={["bottom", "left", "right"]} style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Thêm người dùng</Text>
            <Button onPress={onClose} disabled={submitting}>Đóng</Button>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.body}>
            <FormField label="Họ và tên *" value={draft.fullName} error={errors.fullName}
              disabled={submitting} onChangeText={(value) => onChangeField("fullName", value)} />
            <FormField label="Email *" value={draft.email} error={errors.email} keyboardType="email-address"
              autoCapitalize="none" autoCorrect={false} disabled={submitting}
              onChangeText={(value) => onChangeField("email", value)} />
            <FormField label="Số điện thoại" value={draft.phone} error={errors.phone} keyboardType="phone-pad"
              disabled={submitting} onChangeText={(value) => onChangeField("phone", value)} />
            <PasswordField label="Mật khẩu *" value={draft.password} error={errors.password}
              disabled={submitting} onChange={(value) => onChangeField("password", value)} />
            <PasswordField label="Xác nhận mật khẩu *" value={draft.confirmPassword} error={errors.confirmPassword}
              disabled={submitting} onChange={(value) => onChangeField("confirmPassword", value)} />
            <Text style={styles.label}>Vai trò</Text>
            <View style={styles.roles}>
              {Object.entries(ROLE_LABELS).map(([role, label]) => (
                <Button key={role} mode={draft.role === role ? "contained" : "outlined"}
                  disabled={submitting} accessibilityState={{ selected: draft.role === role, disabled: submitting }}
                  onPress={() => onChangeField("role", role)}>{label}</Button>
              ))}
            </View>
            {!!errors.role && <HelperText type="error">{errors.role}</HelperText>}
            <Text style={styles.hint}>Tài khoản mới sẽ hoạt động ngay, không cần xác thực OTP.</Text>
            {!!error && <HelperText type="error" accessibilityRole="alert">{error}</HelperText>}
          </ScrollView>
          <View style={styles.footer}>
            <Button onPress={onClose} disabled={submitting}>Hủy</Button>
            <Button mode="contained" onPress={onSubmit} loading={submitting} disabled={submitting}>
              Thêm người dùng
            </Button>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end", alignItems: "center" },
  card: { width: "100%", maxWidth: 600, maxHeight: "92%", backgroundColor: colors.white, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, gap: 8 },
  title: { flex: 1, fontSize: 22, fontWeight: "700", color: colors.textPrimary },
  body: { padding: 16 },
  label: { fontSize: 15, fontWeight: "600", color: colors.textPrimary, marginBottom: 8 },
  roles: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  hint: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 16 },
  footer: { flexDirection: "row", justifyContent: "flex-end", flexWrap: "wrap", gap: 8, padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
});
