
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { colors } from "../../theme/colors";
import { spacing, typography } from "../../theme/tokens";

export default function ListError({ message, onRetry, busy = false }) {
  return (
    <View style={styles.container}>
      <Text style={styles.message} accessibilityRole="alert">{message}</Text>
      <Button onPress={onRetry} disabled={busy} loading={busy}>Thử lại</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, alignItems: "center" },
  message: { ...typography.body, color: colors.statusError, textAlign: "center" },
});
