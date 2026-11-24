import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../../theme";

export default function EmptyState({ title, description, icon = "leaf-outline", children, style }) {
  return <View style={[styles.container, style]}>
    <View style={styles.icon}><Ionicons name={icon} size={32} color={colors.primaryLight} accessible={false} /></View>
    <Text accessibilityRole="header" style={styles.title}>{title}</Text>
    {description ? <Text style={styles.description}>{description}</Text> : null}
    {children}
  </View>;
}
const styles = StyleSheet.create({
  container: { padding: spacing.xxl, alignItems: "center", justifyContent: "center", gap: spacing.md },
  icon: { width: 64, height: 64, borderRadius: radius.card, backgroundColor: colors.lightMint,
    alignItems: "center", justifyContent: "center" },
  title: { ...typography.section, color: colors.textPrimary, textAlign: "center" },
  description: { ...typography.body, color: colors.textSecondary, textAlign: "center" },
});
