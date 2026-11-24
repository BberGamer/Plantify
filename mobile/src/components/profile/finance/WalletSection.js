import { componentStyles } from "../../../theme/componentStyles";
import WalletOrder from "./WalletOrder";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { styles } from "./presentation";
import { amountError } from "../../../utils/financeValidation";
export default function WalletSection({
  f,
  amount,
  setAmount,
  topupField,
  setValidationError,
}) {
  return (
    <>
      <Card style={styles.card}>
        <Card.Content style={styles.gap}>
          <Text variant="titleLarge">Nạp tiền vào ví</Text>
          <Text>
            Từ 10.000 đến 10.000.000 VND. Số dư không tự động gia hạn VIP.
          </Text>
          {f.summary && !f.summary.payment_configured && (
            <Text style={styles.notice}>
              Nạp tiền tự động chưa sẵn sàng. Đơn vẫn được lưu để Admin kiểm
              tra; chưa tự động cộng ví.
            </Text>
          )}
          <TextInput
            ref={topupField}
            mode="outlined"
            label="Số tiền (VND)"
            keyboardType="number-pad"
            value={amount}
            onChangeText={setAmount}
            disabled={f.busy}
          />
          <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
            mode="contained"
            loading={f.busy}
            disabled={f.busy}
            onPress={() => {
              const invalid = amountError(amount);
              if (invalid) setValidationError(invalid);
              else
                f.run("topup", {
                  amount: Number(amount),
                });
            }}
          >
            Tạo đơn nạp
          </Button>
        </Card.Content>
      </Card>
      {f.order && <WalletOrder order={f.order} onClose={f.closeOrder} />}
    </>
  );
}
