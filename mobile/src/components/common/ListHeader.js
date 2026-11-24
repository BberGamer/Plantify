import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { colors, layout, radius, spacing, typography } from "../../theme";

export default function ListHeader({ title, subtitle, count, children }) {
  return <View style={styles.container}>
    <View style={styles.row}>
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      {count !== undefined ? <View style={styles.badge}><Text style={styles.count}>{count}</Text></View> : null}
      {children}
    </View>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>;
}
const styles = StyleSheet.create({
  container: { width: "100%", maxWidth: layout.content, alignSelf: "center", padding: spacing.xl, gap: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  title: { ...typography.title, color: colors.textPrimary, flex: 1 },
  subtitle: { ...typography.caption, color: colors.textSecondary },
  badge: { minWidth: 40, minHeight: 36, paddingHorizontal: spacing.md, borderRadius: radius.md,
    alignItems: "center", justifyContent: "center", backgroundColor: colors.lightMint },
  count: { ...typography.label, color: colors.primary },
});
