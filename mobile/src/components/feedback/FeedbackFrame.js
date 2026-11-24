import ScreenHeader from "../common/ScreenHeader";
import { componentStyles } from "../../theme/componentStyles";
import { StyleSheet, View } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing } from "../../theme";

export { statusLabels, typeLabels, feedbackTime } from "./feedbackLabels";

export const feedbackStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 20,
    gap: 16,
    width: "100%",
    maxWidth: 700,
    alignSelf: "center"
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white
  },
  group: {
    gap: spacing.sm
  },
  muted: {
    color: colors.textSecondary
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    alignItems: "center"
  },
  center: {
    alignItems: "center",
    padding: spacing.lg
  }
});

export function FeedbackMessage({ message, onClose }) {
  return (
    <Portal>
      <Dialog style={componentStyles.dialog} visible={!!message} onDismiss={onClose}>
        <Dialog.Title>Đóng góp ý kiến</Dialog.Title>
        <Dialog.Content>
          <Text>{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} onPress={onClose}>Đóng</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

export default function FeedbackFrame({ title, fallback, busy, children }) {
  const router = useRouter();
  return (
    <SafeAreaView
      style={feedbackStyles.screen}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScreenHeader title={title} disabled={busy} onBack={fallback ? () =>
        router.canGoBack() ? router.back() : router.replace(fallback)
      : undefined} />
      {children}
    </SafeAreaView>
  );
}
