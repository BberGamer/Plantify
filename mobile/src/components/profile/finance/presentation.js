import { StyleSheet } from "react-native";

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;
const date = (value) =>
  value
    ? new Date(value).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
    : "—";
const labels = {
  pending: "Chờ xử lý",
  success: "Thành công",
  rejected: "Từ chối",
  expired: "Hết hạn thanh toán",
  credited: "Đã cộng ví",
  review: "Cần đối soát",
  already_processed: "Đơn đã được xử lý",
  topup: "Nạp ví",
  purchase: "Mua VIP",
  adjustment: "Admin cộng tiền",
};
const tones = {
  green: {
    background: "#EDF8F1",
    border: "#BDDCC9",
    text: "#17603D",
    icon: "wallet-plus-outline",
  },
  gold: {
    background: "#FFF8E8",
    border: "#EAD49D",
    text: "#805B10",
    icon: "crown-outline",
  },
  blue: {
    background: "#EEF5FF",
    border: "#C2D6F0",
    text: "#285B92",
    icon: "account-cash-outline",
  },
  red: {
    background: "#FFF1F0",
    border: "#F0C5BF",
    text: "#A33027",
    icon: "close-circle-outline",
  },
  amber: {
    background: "#FFF5E7",
    border: "#EAD0A6",
    text: "#88580C",
    icon: "clock-outline",
  },
  neutral: {
    background: "#F0F3F5",
    border: "#D2DAE0",
    text: "#485B68",
    icon: "receipt-text-outline",
  },
};
const toneFor = (value) =>
  ({
    topup: tones.green,
    purchase: tones.gold,
    adjustment: tones.blue,
    success: tones.green,
    credited: tones.green,
    pending: tones.amber,
    review: tones.amber,
    rejected: tones.red,
    expired: tones.neutral,
    already_processed: tones.blue,
  })[value] || tones.neutral;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F9F6" },
  header: { padding: 14, gap: 6 },
  content: {
    padding: 18,
    gap: 14,
    paddingBottom: 40,
    maxWidth: 900,
    width: "100%",
    alignSelf: "center",
  },
  heading: { fontWeight: "800", color: "#144D37" },
  hero: { borderRadius: 26, padding: 26, gap: 9 },
  heroTitle: { color: "#F8D884", fontSize: 23, fontWeight: "800" },
  light: { color: "#E2F1E7" },
  balance: { color: "white", fontSize: 32, fontWeight: "800" },
  card: { backgroundColor: "white", borderRadius: 20 },
  gap: { gap: 12, paddingVertical: 12 },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  flex: { flex: 1, minWidth: 150 },
  notice: {
    color: "#805A13",
    backgroundColor: "#FFF5DB",
    padding: 12,
    borderRadius: 12,
  },
  qr: { width: "100%", height: 240 },
  filterChip: { borderWidth: 1, borderRadius: 24 },
  transactionCard: { borderWidth: 1, borderLeftWidth: 4, borderRadius: 14 },
  transactionContent: { gap: 6, paddingHorizontal: 12, paddingVertical: 10 },
  transactionHeading: { flexDirection: "row", alignItems: "center", gap: 8 },
  transactionIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    flexShrink: 1,
    minWidth: 0,
  },
  transactionAmount: { fontSize: 18, lineHeight: 24, fontWeight: "800" },
  statusBadge: {
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 1,
  },
  statusText: { fontSize: 12, fontWeight: "700" },
  secondaryText: { color: "#52645D", fontSize: 13 },
  balanceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
    borderTopWidth: 1,
    paddingTop: 6,
  },
  balanceValue: { color: "#183B2B", fontWeight: "700" },
});

export { money, date, labels, tones, toneFor, styles };
