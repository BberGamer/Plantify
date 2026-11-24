import { Image } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { money, date, labels, styles } from "./presentation";
import useOrderCountdown from "../../../hooks/useOrderCountdown";
export default function WalletOrder({ order, onClose }) {
  const remainingSeconds = useOrderCountdown(order);
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.gap}>
        <Text variant="titleMedium">{order.code}</Text>
        <Text>
          {money(order.amount)} ·{" "}
          {labels[order.expired ? "expired" : order.status]}
        </Text>
        <Text>Hạn chuyển khoản: {date(order.expires_at)}</Text>
        {order.status === "pending" && (
          <Text>
            Còn lại: {Math.floor(remainingSeconds / 60)} phút{" "}
            {remainingSeconds % 60} giây
          </Text>
        )}
        {order.status === "pending" &&
          !order.expired &&
          remainingSeconds > 0 && (
            <>
              {order.qr_url && (
                <Image
                  source={{
                    uri: order.qr_url,
                  }}
                  style={styles.qr}
                  resizeMode="contain"
                  accessibilityLabel="QR chuyển khoản"
                />
              )}
              <Text selectable>
                {order.bank_code} ·{" "}
                {order.receiving_account ||
                  order.virtual_account ||
                  order.account_number}{" "}
                · {order.account_name}
              </Text>
              <Text selectable>Nội dung bắt buộc: {order.code}</Text>
            </>
          )}
        <Button onPress={onClose}>Đóng thông tin đơn</Button>
      </Card.Content>
    </Card>
  );
}
