import { StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../../theme";

export default function SectionCard({ title, icon, action, children, style, contentStyle }) {
  return <Card mode="outlined" style={[styles.card, style]}>
    <Card.Content style={[styles.content, contentStyle]}>
      <View style={styles.header}>
        <View style={styles.heading}>
          {icon ? <Ionicons name={icon} size={20} color={colors.primary} accessible={false} /> : null}
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        </View>
        {action}
      </View>
      {children}
    </Card.Content>
  </Card>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: radius.card },
  content: { gap: spacing.lg, paddingVertical: spacing.lg },
  header: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between",
    gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight, paddingBottom: spacing.md },
  heading: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexShrink: 1 },
  title: { ...typography.section, color: colors.textPrimary, flexShrink: 1 },
});
