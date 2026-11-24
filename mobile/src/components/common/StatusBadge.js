import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../../theme";

const neutral = { color: colors.textSecondary, background: colors.borderLight };

// Domain quyết định nhãn và tone; component chỉ trình bày trạng thái.
export default function StatusBadge({ label, icon, tone = neutral }) {
  return <View style={[styles.badge, { backgroundColor: tone.background }]}>
    {icon ? <Ionicons name={icon} size={16} color={tone.color} accessible={false} /> : null}
    <Text style={[styles.label, { color: tone.color }]}>{label}</Text>
  </View>;
}
const styles = StyleSheet.create({
  badge: { alignSelf: "flex-start", maxWidth: "100%", flexDirection: "row", alignItems: "center",
    gap: 6, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  label: { ...typography.label, flexShrink: 1 },
});
