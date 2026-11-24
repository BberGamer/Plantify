import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../../theme";

const TONES = {
  info: { color: colors.info, background: colors.infoBackground, icon: "information-circle-outline" },
  success: { color: colors.statusSuccess, background: colors.lightMint, icon: "checkmark-circle-outline" },
  warning: { color: colors.statusWarning, background: colors.warningBackground, icon: "alert-circle-outline" },
  error: { color: colors.statusError, background: colors.errorBackground, icon: "alert-circle-outline" },
};
export default function NoticeBanner({ tone = "info", title, message, icon, children, style }) {
  const meta = TONES[tone] || TONES.info;
  return <View style={[styles.banner, { backgroundColor: meta.background }, style]}
    accessibilityLiveRegion="polite" accessibilityRole={tone === "error" ? "alert" : undefined}>
    <Ionicons name={icon || meta.icon} size={22} color={meta.color} accessible={false} />
    <View style={styles.content}>
      {title ? <Text style={[styles.title, { color: meta.color }]}>{title}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {children}
    </View>
  </View>;
}
const styles = StyleSheet.create({
  banner: { flexDirection: "row", alignItems: "flex-start", padding: spacing.lg, gap: spacing.md, borderRadius: radius.card },
  content: { flex: 1, minWidth: 0, gap: spacing.sm },
  title: { ...typography.label },
  message: { ...typography.body, color: colors.textPrimary },
});
