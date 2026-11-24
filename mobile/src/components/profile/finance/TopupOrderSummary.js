import { Image, View } from "react-native";
import { Text } from "react-native-paper";
import DetailField from "../../common/DetailField";
import StatusBadge from "../../common/StatusBadge";
import { money, date, labels, styles, toneFor } from "./presentation";
import useOrderCountdown from "../../../hooks/useOrderCountdown";

export default function TopupOrderSummary({ order }) {
  const remainingSeconds = useOrderCountdown(order);
  // Đồng hồ thiết bị chỉ phục vụ đếm ngược; backend xác định đơn đã hết hạn hay chưa.
  const status = order.expired && order.status === "pending" ? "expired" : order.status;
  const tone = toneFor(status);
  const receivingAccount = order.receiving_account || order.virtual_account || order.account_number;
  return <View style={styles.gap}>
    <View style={styles.orderGroup}>
      <Text style={styles.orderGroupTitle}>Thông tin đơn nạp</Text>
      <DetailField label="Mã đơn nạp" value={order.code} />
      <StatusBadge label={labels[status] || "Đã ghi nhận"} tone={{ color: tone.text, background: tone.background }} />
      <Text style={styles.orderAmount}>{money(order.amount)}</Text>
      <DetailField label="Hạn chuyển khoản" value={date(order.expires_at)} />
      {status === "pending" ? <Text style={styles.countdown}>
        {remainingSeconds > 0
          ? `Còn lại: ${Math.floor(remainingSeconds / 60)} phút ${remainingSeconds % 60} giây`
          : "Đang kiểm tra trạng thái đơn nạp…"}
      </Text> : null}
    </View>
    {status === "pending" ? <>
      {order.qr_url ? <View style={styles.orderGroup}>
        <Text style={styles.orderGroupTitle}>Quét mã để chuyển khoản</Text>
        <Image source={{ uri: order.qr_url }} style={styles.qr} resizeMode="contain" accessibilityLabel="QR chuyển khoản" />
      </View> : null}
      <View style={styles.orderGroup}>
        <Text style={styles.orderGroupTitle}>Thông tin nhận tiền</Text>
        <DetailField label="Ngân hàng" value={order.bank_code} copyValue={order.bank_code} />
        <DetailField label="Tài khoản nhận" value={receivingAccount} copyValue={receivingAccount} />
        <DetailField label="Tên người nhận" value={order.account_name} copyValue={order.account_name} />
      </View>
      <View style={[styles.orderGroup, styles.transferCode]}>
        <DetailField label="Nội dung chuyển khoản bắt buộc" value={order.code} copyValue={order.code} />
        <Text style={styles.secondaryText}>Giữ nguyên nội dung và chuyển đúng số tiền để hệ thống xác nhận đơn nạp.</Text>
      </View>
    </> : null}
  </View>;
}
