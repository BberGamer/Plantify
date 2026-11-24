import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { colors, spacing, typography } from "../../theme";

export default function ScreenHeader({ title, subtitle, onBack, backLabel = "Quay lại", disabled, children }) {
  const [sideWidth, setSideWidth] = useState(48);
  return <View style={styles.header}>
    <View style={[styles.back, { width: sideWidth }]}>
      {onBack ? <IconButton icon="chevron-left" size={20} style={styles.backButton} iconColor={colors.primary}
        onPress={onBack} disabled={disabled} accessibilityLabel={backLabel} /> : null}
    </View>
    <View style={styles.center}>
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    <View style={styles.actions} onLayout={({ nativeEvent }) => {
      const width = Math.ceil(nativeEvent.layout.width);
      setSideWidth((previous) => previous === width ? previous : width);
    }}>{children}</View>
  </View>;
}
const styles = StyleSheet.create({
  header: { minHeight: 64, flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.xs,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  back: { alignItems: "flex-start" },
  backButton: { width: 44, height: 44, margin: 2 },
  center: { flex: 1, minWidth: 0, paddingVertical: spacing.md },
  title: { ...typography.section, color: colors.textPrimary, textAlign: "center" },
  subtitle: { ...typography.caption, color: colors.textSecondary, textAlign: "center", marginTop: 2 },
  actions: { minWidth: 48, flexDirection: "row", alignItems: "center", justifyContent: "flex-end" },
});
