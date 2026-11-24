import { colors, radius } from "../../../theme";
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
    background: colors.lightMint,
    border: "#BDDCC9",
    text: colors.primary,
    icon: "wallet-plus-outline",
  },
  gold: {
    background: "#FFF8E8",
    border: "#EAD49D",
    text: "#805B10",
    icon: "crown-outline",
  },
  blue: {
    background: colors.infoBackground,
    border: "#C2D6F0",
    text: colors.info,
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
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    padding: 20,
    gap: 6
  },
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
    maxWidth: 900,
    width: "100%",
    alignSelf: "center"
  },
  heading: {
    fontWeight: "800",
    color: colors.primary
  },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    gap: 9
  },
  heroTitle: {
    lineHeight: 32,
    color: colors.white,
    fontSize: 24,
    fontWeight: "800"
  },
  light: {
    color: "#E2F1E7"
  },
  balance: {
    lineHeight: 42,
    flexShrink: 1,
    color: "white",
    fontSize: 32,
    fontWeight: "800"
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "white",
    borderRadius: radius.card
  },
  gap: {
    gap: 12,
    paddingVertical: 12
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  flex: {
    flex: 1,
    minWidth: 0
  },
  notice: {
    color: colors.statusWarning,
    backgroundColor: colors.warmPeachBg,
    padding: 12,
    borderRadius: 12
  },
  shortcuts: { gap: 12, marginTop: 4 },
  shortcut: { borderWidth: 1, borderColor: "#BDDCC9", borderRadius: radius.card, paddingVertical: 8 },
  shortcutTitle: { fontSize: 16, fontWeight: "700", color: colors.primary },
  orderGroup: { padding: 16, gap: 12, borderRadius: radius.card, backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.border },
  orderGroupTitle: { fontSize: 16, fontWeight: "700", color: colors.primary },
  transferCode: { backgroundColor: colors.lightMint, borderColor: "#BDDCC9" },
  orderAmount: { fontSize: 24, lineHeight: 32, fontWeight: "800", color: colors.primary },
  countdown: { color: "#88580C", backgroundColor: "#FFF5E7", padding: 10, borderRadius: radius.sm },
  qr: {
    width: "100%",
    height: 240
  },
  transactionCard: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: radius.card
  },
  transactionContent: {
    padding: 16,
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  transactionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  transactionIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  transactionTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    flexShrink: 1,
    minWidth: 0
  },
  transactionAmount: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800"
  },
  statusBadge: {
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 1
  },
  statusText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700"
  },
  secondaryText: {
    color: colors.textSecondary,
    fontSize: 13
  },
  balanceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
    borderTopWidth: 1,
    paddingTop: 6
  },
  balanceValue: {
    color: colors.textPrimary,
    fontWeight: "700"
  }
});

export { money, date, labels, tones, toneFor, styles };
