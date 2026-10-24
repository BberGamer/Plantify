// PlantDeleteModal.js - Xác nhận xóa cây và hiển thị trạng thái xử lý.
import React from "react";
import { StyleSheet } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";
import { colors } from "../../../theme/colors";

export default function PlantDeleteModal({
  plant,
  deleting,
  error,
  onClose,
  onConfirm,
}) {
  return (
    <Portal>
      <Dialog
        visible={Boolean(plant)}
        onDismiss={onClose}
        dismissable={!deleting}
        dismissableBackButton={!deleting}
        style={styles.dialog}
      >
        <Dialog.Title style={styles.title}>Xóa cây?</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.title}>
            Bạn có chắc muốn xóa {plant?.common_name}?
          </Text>
          {!!error && (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            onPress={onClose}
            disabled={deleting}
            textColor={colors.textSecondary}
          >
            Hủy
          </Button>
          <Button
            onPress={onConfirm}
            loading={deleting}
            disabled={deleting}
            textColor={colors.statusError}
          >
            {deleting ? "Đang xóa…" : "Xóa"}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: { backgroundColor: colors.white },
  title: { color: colors.textPrimary },
  error: { color: colors.statusError, marginTop: 12 },
});
