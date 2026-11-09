import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "../../theme";

export default function TreatmentStateView({ loading, error, empty, onRetry }) {
  const message = error || empty;
  return <View style={styles.container}>
    {loading ? <><ActivityIndicator size="large" /><Text style={styles.text}>Đang tải thông tin điều trị...</Text></> : <>
      <Ionicons name={error ? "alert-circle-outline" : "leaf-outline"} size={42} color={error ? colors.statusError : colors.primaryLight} />
      <Text style={[styles.text, error && styles.error]} accessibilityRole={error ? "alert" : undefined}>{message}</Text>
      {!!error && <Button onPress={onRetry}>Thử lại</Button>}
    </>}
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 280, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.xl },
  text: { ...typography.body, color: colors.textSecondary, textAlign: "center" },
  error: { color: colors.statusError },
});
