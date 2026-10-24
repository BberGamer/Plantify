// ResetEmailForm.js - Khối giao diện ResetEmailForm.

import {
  View,
  StyleSheet,
} from "react-native";
import { Button, Text } from "react-native-paper";
import FormField from "../common/FormField";
import { control, spacing, radius } from "../../theme/tokens";
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
        <View style={styles.emailField}>
        <FormField
          label="Địa chỉ email"
          containerStyle={styles.emailGroup}
          placeholder="Địa chỉ email"
          placeholderTextColor={colors.textMuted}
          value={email}
          disabled={busy}
          onChangeText={(val) => {
            onEmailChange(val);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
        </View>
        <Button
          mode="outlined"
          contentStyle={{ minHeight: control.minHeight }}
          onPress={onSend}
          disabled={busy || (codeSent && countdown > 0)}
          loading={sendingCode}
        >
          Gửi mã
        </Button>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  emailGroup: { marginBottom: 0 },
  emailField: { flex: 1 },
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
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },

});
