import { Image, View } from "react-native";
import { Text } from "react-native-paper";
import DetailField from "../../common/DetailField";
import StatusBadge from "../../common/StatusBadge";
import { money, date, labels, styles, toneFor } from "./presentation";
import useOrderCountdown from "../../../hooks/useOrderCountdown";

export default function TopupOrderSummary({ order }) {
  const remainingSeconds = useOrderCountdown(order);
  const status = order.expired ? "expired" : order.status;
  const tone = toneFor(status);
  return <View style={styles.gap}>
    <DetailField label="Mã đơn nạp" value={order.code} />
    <StatusBadge label={labels[status] || "Đã ghi nhận"} tone={{ color: tone.text, background: tone.background }} />
    <DetailField label="Số tiền" value={money(order.amount)} />
    <DetailField label="Hạn chuyển khoản" value={date(order.expires_at)} />
    {order.status === "pending" && <Text>Còn lại: {Math.floor(remainingSeconds / 60)} phút {remainingSeconds % 60} giây</Text>}
    {order.status === "pending" && !order.expired && remainingSeconds > 0 && <>
      {order.qr_url ? <Image source={{ uri: order.qr_url }} style={styles.qr} resizeMode="contain" accessibilityLabel="QR chuyển khoản" /> : null}
      <DetailField label="Ngân hàng" value={order.bank_code} />
      <DetailField label="Tài khoản nhận" value={order.receiving_account || order.virtual_account || order.account_number} />
      <DetailField label="Tên người nhận" value={order.account_name} />
      <DetailField label="Nội dung chuyển khoản bắt buộc" value={order.code} />
    </>}
  </View>;
}
