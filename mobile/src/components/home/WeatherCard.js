import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native-paper";
import { colors, radius, spacing, typography } from "../../theme";

export default function WeatherCard() {
  return <View style={styles.card}>
    <Ionicons name="sunny-outline" size={26} color={colors.primary} />
    <View style={styles.copy}>
      <Text style={styles.title}>Một chút quan tâm mỗi ngày</Text>
      <Text style={styles.body}>Kiểm tra độ ẩm đất trước khi tưới cây hôm nay.</Text>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    padding: spacing.lg,
    marginTop: spacing.xxl,
    backgroundColor: colors.lightMint,
    borderRadius: radius.card
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs
  },
  title: {
    ...typography.label,
    color: colors.textPrimary
  },
  body: {
    ...typography.body,
    color: colors.textSecondary
  }
});
