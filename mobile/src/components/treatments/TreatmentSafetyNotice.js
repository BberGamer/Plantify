import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../../theme";

export default function TreatmentSafetyNotice({ children }) {
  return (
    <View style={styles.notice} accessibilityRole="summary">
      <Ionicons name="shield-checkmark-outline" size={22} color="#946017" />
      <View style={styles.content}>
        <Text style={styles.title}>Lưu ý an toàn</Text>
        <Text style={styles.body}>{children}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md, padding: spacing.lg, borderRadius: radius.card, backgroundColor: colors.warmPeachBg },
  content: { flex: 1, gap: spacing.xs },
  title: { ...typography.label, color: colors.textPrimary },
  body: { ...typography.body, color: colors.textSecondary },
});
