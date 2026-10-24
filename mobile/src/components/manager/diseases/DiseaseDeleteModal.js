import React from "react";
import { Button, Dialog, Portal, Text } from "react-native-paper";
import { colors } from "../../../theme/colors";

export default function DiseaseDeleteModal({
  disease,
  deleting,
  error,
  onClose,
  onConfirm,
}) {
  return (
    <Portal>
      <Dialog
        visible={Boolean(disease)}
        onDismiss={onClose}
        dismissable={!deleting}
        dismissableBackButton={!deleting}
      >
        <Dialog.Title>Xóa bệnh cây?</Dialog.Title>
        <Dialog.Content>
          <Text>
            Bạn có chắc muốn xóa “{disease?.disease_name}”? Bệnh sẽ được gỡ khỏi
            tất cả cây liên quan. Thao tác này không thể hoàn tác.
          </Text>
          {!!error && (
            <Text
              style={{ color: colors.statusError }}
              accessibilityRole="alert"
            >
              {error}
            </Text>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onClose} disabled={deleting}>
            Hủy
          </Button>
          <Button
            onPress={onConfirm}
            disabled={deleting}
            loading={deleting}
            textColor={colors.statusError}
          >
            {deleting ? "Đang xóa…" : "Xóa bệnh"}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
