import { StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { colors, spacing, typography } from "../../theme";

export default function ScreenHeader({ title, onBack, backLabel = "Quay lại", disabled, children }) {
  return <View style={styles.header}>
    {onBack ? <IconButton icon="arrow-left" onPress={onBack} disabled={disabled} accessibilityLabel={backLabel} /> : <View style={styles.slot} />}
    <Text accessibilityRole="header" style={styles.title}>{title}</Text>
    <View style={styles.actions}>{children}</View>
  </View>;
}
const styles = StyleSheet.create({
  header: { minHeight: 64, flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.xs,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { ...typography.section, color: colors.textPrimary, flex: 1, textAlign: "center" },
  slot: { width: 48 },
  actions: { minWidth: 48, flexDirection: "row", alignItems: "center", justifyContent: "flex-end" },
});
