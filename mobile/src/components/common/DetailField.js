import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../../theme";

export default function DetailField({ label, value, emptyText = "Chưa có thông tin", style }) {
  const missing = value === null || value === undefined || value === "";
  return <View style={[styles.field, style]}>
    <Text style={styles.label}>{label}</Text>
    <Text selectable style={styles.value}>{missing ? emptyText : value}</Text>
  </View>;
}

export function DetailRow({ icon, label, value, emptyText, action, style }) {
  return <View style={[styles.row, style]}>
    {icon ? <View style={styles.icon}><Ionicons name={icon} size={20} color={colors.primary} accessible={false} /></View> : null}
    <DetailField label={label} value={value} emptyText={emptyText} style={styles.flex} />
    {action}
  </View>;
}
const styles = StyleSheet.create({
  field: { gap: spacing.xs, minWidth: 0 },
  label: { ...typography.caption, color: colors.textSecondary, fontWeight: "600" },
  value: { ...typography.body, color: colors.textPrimary },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md },
  flex: { flex: 1 },
  icon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.lightMint,
    alignItems: "center", justifyContent: "center" },
});
