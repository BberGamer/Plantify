import { ScrollView, StyleSheet } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";
import { colors, spacing } from "../../theme";
import { componentStyles } from "../../theme/componentStyles";

export default function ActionNoticeDialog({ notice, onDismiss, onUpgrade }) {
  return <Portal>
    <Dialog visible={!!notice} onDismiss={onDismiss} style={[componentStyles.dialog, styles.dialog]}>
      <Dialog.Icon icon={notice?.upgrade ? "leaf-circle-outline" : "check-circle-outline"} color={colors.primary} />
      <Dialog.Title style={styles.title}>{notice?.title}</Dialog.Title>
      <Dialog.ScrollArea style={styles.body}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text accessibilityRole="alert" style={styles.message}>{notice?.message}</Text>
        </ScrollView>
      </Dialog.ScrollArea>
      <Dialog.Actions style={styles.actions}>
        <Button mode={notice?.upgrade ? "outlined" : "contained"} onPress={onDismiss}
          style={componentStyles.buttonShape} contentStyle={componentStyles.button}>Tôi đã hiểu</Button>
        {notice?.upgrade ? <Button mode="contained" icon="crown-outline" onPress={onUpgrade}
          style={componentStyles.buttonShape} contentStyle={componentStyles.button}>Xem gói VIP</Button> : null}
      </Dialog.Actions>
    </Dialog>
  </Portal>;
}
const styles = StyleSheet.create({
  dialog: { borderWidth: 1, borderColor: colors.border, maxWidth: 440, maxHeight: "85%" },
  title: { color: colors.primary, textAlign: "center" },
  body: { backgroundColor: colors.lightMint, borderColor: colors.border, flexShrink: 1 },
  content: { paddingVertical: spacing.lg },
  message: { color: colors.textPrimary, lineHeight: 24 },
  actions: { flexWrap: "wrap", justifyContent: "center", gap: spacing.sm, padding: spacing.lg },
});
