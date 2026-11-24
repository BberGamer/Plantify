import { Image } from "react-native";
import { Text } from "react-native-paper";
import { money, date, labels, styles } from "./presentation";
import useOrderCountdown from "../../../hooks/useOrderCountdown";
export default function OrderDetails({ order }) {
  const remainingSeconds = useOrderCountdown(order);
  return (
    <>
      <Text selectable>{order.code}</Text>
      <Text>
        {money(order.amount)} ·{" "}
        {labels[order.expired ? "expired" : order.status]}
      </Text>
      <Text>Hạn: {date(order.expires_at)}</Text>
      {order.status === "pending" && !order.expired && remainingSeconds > 0 && (
        <>
          {order.qr_url && (
            <Image
              source={{
                uri: order.qr_url,
              }}
              style={styles.qr}
              resizeMode="contain"
            />
          )}
          <Text selectable>
            {order.bank_code} ·{" "}
            {order.receiving_account ||
              order.virtual_account ||
              order.account_number}{" "}
            · {order.account_name}
          </Text>
          <Text selectable>Nội dung: {order.code}</Text>
        </>
      )}
    </>
  );
}
