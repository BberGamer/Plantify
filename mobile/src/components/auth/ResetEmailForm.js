// ResetEmailForm.js - Khối giao diện ResetEmailForm.

import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native-paper";
import { colors } from "../../theme/colors";
export default function ResetEmailForm({
  email,
  sendingCode,
  busy,
  codeSent,
  countdown,
  onEmailChange,
  onSend,
}) {
  return (
    <View style={styles.section}>
      <View style={styles.stepHeader}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>1</Text>
        </View>
        <Text style={styles.stepTitle}>Xác thực email</Text>
      </View>

      <View style={styles.emailRow}>
        <TextInput
          style={styles.emailInput}
          placeholder="Địa chỉ email"
          placeholderTextColor={colors.textMuted}
          value={email}
          editable={!busy}
          onChangeText={(val) => {
            onEmailChange(val);
          }}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TouchableOpacity
          style={[
            styles.sendCodeButton,
            sendingCode && styles.sendCodeButtonDisabled,
          ]}
          onPress={onSend}
          disabled={busy || (codeSent && countdown > 0)}
          activeOpacity={0.8}
        >
          {sendingCode ? (
            <ActivityIndicator size="small" color="#111827" />
          ) : (
            <Text style={styles.sendCodeText}>Gửi mã</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
  emailRow: {
    flexDirection: "row",
    gap: 10,
  },
  emailInput: {
    flex: 1,
    height: 48,
    borderWidth: 1.2,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: "#FFFFFF",
  },
  sendCodeButton: {
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1.2,
    borderColor: "#111827",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  sendCodeButtonDisabled: {
    opacity: 0.6,
  },
  sendCodeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
});
