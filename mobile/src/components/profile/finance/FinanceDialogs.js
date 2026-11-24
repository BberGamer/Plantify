import OrderDetails from "./OrderDetails";
import { ScrollView } from "react-native";
import { Button, Dialog, Portal, Text, TextInput } from "react-native-paper";
import { money, styles } from "./presentation";
export default function FinanceDialogs({
  dialog,
  validationError,
  f,
  viewedOrder,
  amount,
  customer,
  reason,
  setReason,
  setDialog,
  confirm,
  setValidationError,
}) {
  return (
    <Portal>
      <Dialog
        visible={!!dialog && !validationError}
        dismissable={!f.busy}
        dismissableBackButton={!f.busy}
        onDismiss={() => {
          if (!f.busy) setDialog(null);
        }}
      >
        <Dialog.Title>
          {dialog?.view ? "Chi tiết đơn nạp" : "Xác nhận giao dịch"}
        </Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView contentContainerStyle={styles.gap}>
            {dialog?.view ? (
              <OrderDetails order={viewedOrder} />
            ) : (
              <>
                <Text>
                  {dialog?.plan
                    ? `Mua ${dialog.plan.code}: ${money(dialog.plan.price)}, ${dialog.plan.days} ngày. Tiền sẽ trừ vào ví ngay sau khi xác nhận.`
                    : dialog?.adjust
                      ? `Cộng ${money(amount)} cho ${customer?.email}. Đây là điều chỉnh riêng, không xác nhận đơn SePay.`
                      : dialog?.status === "success"
                        ? `Duyệt cộng ${money(dialog.amount)} vào ví. Đảm bảo đã kiểm tra chứng từ.`
                        : "Từ chối đơn nạp. Đơn đã kết thúc không thể sửa lại."}
                </Text>
                {!dialog?.plan && (
                  <TextInput
                    mode="outlined"
                    multiline
                    label="Lý do bắt buộc (5–500 ký tự)"
                    value={reason}
                    onChangeText={setReason}
                    maxLength={500}
                    disabled={f.busy}
                  />
                )}
                <Text>{f.message}</Text>
              </>
            )}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button disabled={f.busy} onPress={() => setDialog(null)}>
            Đóng
          </Button>
          {!dialog?.view && (
            <Button loading={f.busy} disabled={f.busy} onPress={confirm}>
              Xác nhận
            </Button>
          )}
        </Dialog.Actions>
      </Dialog>
      <Dialog
        visible={!!validationError}
        onDismiss={() => setValidationError("")}
      >
        <Dialog.Icon icon="alert-circle-outline" color="#A33027" />
        <Dialog.Title>Kiểm tra thông tin</Dialog.Title>
        <Dialog.Content>
          <Text accessibilityRole="alert">{validationError}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setValidationError("")}>Đã hiểu</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
