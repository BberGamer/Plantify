import { StyleSheet, View } from "react-native";
import { Button, Dialog, IconButton, Portal, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing } from "../../theme";

export const statusLabels = { pending: "Chờ xử lý", accepted: "Đã tiếp nhận", rejected: "Từ chối" };
export const typeLabels = { diagnosis_feedback: "Feedback chẩn đoán", proactive_feedback: "Feedback Chủ động" };
export const feedbackTime = value => new Date(value).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

export const feedbackStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", backgroundColor: colors.white, paddingRight: spacing.md },
  title: { flex: 1, color: colors.textPrimary, fontWeight: "700" },
  content: { padding: spacing.lg, gap: spacing.md, width: "100%", maxWidth: 700, alignSelf: "center" },
  card: { backgroundColor: colors.white },
  group: { gap: spacing.sm },
  muted: { color: colors.textSecondary },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, alignItems: "center" },
  center: { alignItems: "center", padding: spacing.lg },
});

export function FeedbackMessage({ message, onClose }) {
  return (
    <Portal>
      <Dialog visible={!!message} onDismiss={onClose}>
        <Dialog.Title>Đóng góp ý kiến</Dialog.Title>
        <Dialog.Content><Text>{message}</Text></Dialog.Content>
        <Dialog.Actions><Button onPress={onClose}>Đóng</Button></Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

export default function FeedbackFrame({ title, fallback, busy, children }) {
  const router = useRouter();
  return (
    <SafeAreaView style={feedbackStyles.screen} edges={["top", "left", "right", "bottom"]}>
      <View style={feedbackStyles.header}>
        {!!fallback && <IconButton icon="arrow-left" accessibilityLabel="Quay lại" disabled={busy}
          onPress={() => router.canGoBack() ? router.back() : router.replace(fallback)} />}
        <Text variant="titleLarge" style={[feedbackStyles.title, !fallback && { padding: spacing.lg }]}>{title}</Text>
      </View>
      {children}
    </SafeAreaView>
  );
}
