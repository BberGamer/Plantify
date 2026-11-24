import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { colors, spacing, typography } from "../../theme";

export default function LoadingState({ message = "Đang tải dữ liệu…", style }) {
  return <View style={[styles.container, style]} accessibilityLiveRegion="polite">
    <ActivityIndicator size="large" accessibilityLabel={message} />
    <Text style={styles.text}>{message}</Text>
  </View>;
}
const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", padding: spacing.xxl, gap: spacing.md },
  text: { ...typography.body, color: colors.textSecondary, textAlign: "center" },
});
