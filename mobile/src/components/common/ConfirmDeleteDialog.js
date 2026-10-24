
import { StyleSheet } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/tokens";

// Hai danh mục có cùng chính sách: không đóng/submit lại trong lúc xóa.
export default function ConfirmDeleteDialog({ visible, title, children, pending, error, onClose, onConfirm }) {
  const close = () => { if (!pending) onClose(); };
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={close} dismissable={!pending} dismissableBackButton={!pending}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text>{children}</Text>
          {!!error && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={close} disabled={pending}>Hủy</Button>
          <Button onPress={() => { if (!pending) onConfirm(); }} loading={pending} disabled={pending} textColor={colors.statusError}>
            Xóa
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({ error: { color: colors.statusError, marginTop: spacing.md } });
