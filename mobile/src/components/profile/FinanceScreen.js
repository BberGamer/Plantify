import { useRef, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Chip, Dialog, Icon, Portal, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import useFinance from "../../hooks/useFinance";
import useScreenScope from "../../hooks/useScreenScope";
import userService from "../../services/userService";
import getErrorMessage from "../../utils/getErrorMessage";

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;
const date = (value) => value ? new Date(value).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "—";
const labels = { pending: "Chờ xử lý", success: "Thành công", rejected: "Từ chối", expired: "Hết hạn thanh toán",
  credited: "Đã cộng ví", review: "Cần đối soát", already_processed: "Đơn đã được xử lý", topup: "Nạp ví", purchase: "Mua VIP", adjustment: "Admin cộng tiền" };
const tones = {
  green: { background: "#EDF8F1", border: "#BDDCC9", text: "#17603D", icon: "wallet-plus-outline" },
  gold: { background: "#FFF8E8", border: "#EAD49D", text: "#805B10", icon: "crown-outline" },
  blue: { background: "#EEF5FF", border: "#C2D6F0", text: "#285B92", icon: "account-cash-outline" },
  red: { background: "#FFF1F0", border: "#F0C5BF", text: "#A33027", icon: "close-circle-outline" },
  amber: { background: "#FFF5E7", border: "#EAD0A6", text: "#88580C", icon: "clock-outline" },
  neutral: { background: "#F0F3F5", border: "#D2DAE0", text: "#485B68", icon: "receipt-text-outline" },
};
const toneFor = (value) => ({ topup: tones.green, purchase: tones.gold, adjustment: tones.blue,
  success: tones.green, credited: tones.green, pending: tones.amber, review: tones.amber,
  rejected: tones.red, expired: tones.neutral, already_processed: tones.blue }[value] || tones.neutral);

function FinanceChip({ selected, tone = tones.green, children, ...props }) {
  return <Chip {...props} selected={selected} showSelectedOverlay={false}
    selectedColor={selected ? "#FFFFFF" : tone.text}
    style={[styles.filterChip, { backgroundColor: selected ? tone.text : tone.background, borderColor: tone.border }]}
    textStyle={{ color: selected ? "#FFFFFF" : tone.text, fontWeight: selected ? "700" : "500" }}>{children}</Chip>;
}

export default function FinanceScreen({ admin = false, section = "vip" }) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const f = useFinance(admin, section);
  const showVip = !admin && section === "vip";
  const showWallet = !admin && section === "wallet";
  const showHistory = admin || section === "history";
  const { capture } = useScreenScope();
  const topupField = useRef(null);
  const [amount, setAmount] = useState(!admin && section === "wallet" && typeof params.amount === "string" && /^\d{5,8}$/.test(params.amount) ? params.amount : "");
  const [dialog, setDialog] = useState(null);
  const [reason, setReason] = useState("");
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [searchError, setSearchError] = useState("");
  const searchVersion = useRef(0);
  const viewedOrder = dialog?.view && f.order?._id === dialog.view._id ? f.order : dialog?.view;
  const findCustomers = async () => {
    const version = ++searchVersion.current, scope = capture();
    try {
      const result = await userService.getUsers({ search, role: "customer", limit: 10 });
      if (scope() && version === searchVersion.current) { setCustomers(result.data?.items || []); setSearchError(""); }
    } catch (e) { if (scope() && version === searchVersion.current) setSearchError(getErrorMessage(e)); }
  };
  const confirm = async () => {
    let ok;
    if (dialog.plan) ok = await f.run("purchase", { plan: dialog.plan.code });
    else if (dialog.adjust) ok = await f.run("adjust", { user_id: customer?._id, amount: Number(amount), reason });
    else ok = await f.run("review", { status: dialog.status, reason }, dialog.id);
    if (ok) { setDialog(null); setReason(""); }
  };
  return <SafeAreaView style={styles.safe}>
    <View style={styles.header}>
      {!admin && <Button onPress={() => router.back()} icon="arrow-left">Quay lại</Button>}
      <Text variant="titleLarge" style={styles.heading}>{admin ? "Quản lý tài chính" : { vip: "Tài khoản VIP", wallet: "Ví tiền", history: "Lịch sử giao dịch" }[section]}</Text>
    </View>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {!admin && !showHistory && <LinearGradient colors={["#103B2D", "#247855"]} style={styles.hero}>
        <Icon source={showVip ? "crown" : "wallet-outline"} color="#F8D884" size={30} />
        <Text style={styles.heroTitle}>{showWallet ? "Ví Plantify của bạn" : f.summary?.isproaccount ? `Plantify ${f.summary.vip_plan}` : "Khu vườn của bạn, nhiều hơn nữa"}</Text>
        <Text style={styles.light}>Số dư ví</Text><Text style={styles.balance}>{money(f.summary?.balance)}</Text>
        {showVip && f.summary?.isproaccount && <Text style={styles.light}>Hết hạn: {date(new Date(new Date(f.summary.vip_expires_at).getTime() - 1))}</Text>}
        <Text style={styles.light}>{showVip ? "VIP mở khóa AI, không giới hạn cây trong vườn và cây yêu thích." : "Nạp tiền để mua gói VIP. Ví không tự động gia hạn."}</Text>
      </LinearGradient>}
      {!!f.message && <Text accessibilityRole="alert" style={styles.notice}>{f.message}</Text>}
      {f.loading && <ActivityIndicator />}
      {showVip && <>
        <Text variant="titleLarge" style={styles.heading}>Chọn gói VIP</Text>
        {f.summary?.plans?.map((plan) => <Card key={plan.code} style={styles.card}>
          <Card.Content style={styles.row}><View style={styles.flex}>
            <Text variant="titleMedium">{plan.name}</Text><Text>{plan.days} ngày · {money(plan.price)}</Text>
          </View><Button mode="contained" disabled={f.busy} onPress={() => {
            if (f.summary.balance < plan.price) router.push({ pathname: "/customer/wallet", params: { amount: String(Math.max(10000, plan.price - f.summary.balance)) } });
            else setDialog({ plan });
          }}>{f.summary.balance < plan.price ? "Nạp để mua" : "Mua gói"}</Button></Card.Content>
        </Card>)}
        <Button icon="wallet-outline" disabled={f.busy} onPress={() => router.push("/customer/wallet")}>Đến ví tiền</Button>
        <Button disabled={f.busy} onPress={() => router.navigate("/customer/profile")}>Xem hồ sơ VIP của tôi</Button>
      </>}
      {showWallet && <>
        <Card style={styles.card}><Card.Content style={styles.gap}>
          <Text variant="titleLarge">Nạp tiền vào ví</Text>
          <Text>Từ 10.000 đến 10.000.000 VND. Số dư không tự động gia hạn VIP.</Text>
          {!f.summary?.payment_configured && <Text style={styles.notice}>SePay chưa được cấu hình. Đơn vẫn được lưu để Admin xử lý; chưa có thông tin chuyển khoản.</Text>}
          <TextInput ref={topupField} mode="outlined" label="Số tiền (VND)" keyboardType="number-pad" value={amount} onChangeText={setAmount} disabled={f.busy} />
          <Button mode="contained" disabled={f.busy} onPress={() => f.run("topup", { amount: Number(amount) })}>Tạo đơn nạp</Button>
        </Card.Content></Card>
        {f.order && <Card style={styles.card}><Card.Content style={styles.gap}>
          <Text variant="titleMedium">{f.order.code}</Text>
          <Text>{money(f.order.amount)} · {labels[f.order.expired ? "expired" : f.order.status]}</Text>
          <Text>Hạn chuyển khoản: {date(f.order.expires_at)}</Text>
          {f.order.status === "pending" && <Text>Còn lại: {Math.floor(f.remainingSeconds / 60)} phút {f.remainingSeconds % 60} giây</Text>}
          {f.order.status === "pending" && !f.order.expired && f.remainingSeconds > 0 && <>
            {f.order.qr_url && <Image source={{ uri: f.order.qr_url }} style={styles.qr} resizeMode="contain" accessibilityLabel="QR chuyển khoản" />}
            <Text selectable>{f.order.bank_code} · {f.order.account_number} · {f.order.account_name}</Text>
            <Text selectable>Nội dung bắt buộc: {f.order.code}</Text>
          </>}
          <Button onPress={f.closeOrder}>Đóng thông tin đơn</Button>
        </Card.Content></Card>}
      </>}
      {!admin && !showHistory && <Button icon="history" disabled={f.busy} onPress={() => router.push("/customer/transactions")}>Xem lịch sử giao dịch</Button>}
      {admin && <Card style={styles.card}><Card.Content style={styles.gap}>
        <Text variant="titleMedium">Cộng số dư thủ công</Text>
        <TextInput label="Tìm Customer theo tên hoặc email" value={search} onChangeText={(v) => { setSearch(v); setCustomer(null); }} />
        <Button disabled={f.busy} onPress={findCustomers}>Tìm người dùng</Button>
        {!!searchError && <Text>{searchError}</Text>}
        {customers.map((u) => <Button key={u._id} mode={customer?._id === u._id ? "contained" : "text"} onPress={() => setCustomer(u)}>{u.fullName} · {u.email}</Button>)}
        <TextInput label="Số tiền cộng (VND)" keyboardType="number-pad" value={amount} onChangeText={setAmount} />
        <Button disabled={!customer || f.busy} onPress={() => { setReason(""); setDialog({ adjust: true }); }}>Tiếp tục cộng tiền</Button>
      </Card.Content></Card>}
      {showHistory && <>
      <View style={styles.wrap}>{["orders", "transactions", ...(admin ? ["events"] : [])].map((kind) =>
        <FinanceChip key={kind} selected={f.kind === kind} disabled={f.busy} onPress={() => f.selectKind(kind)}>{ { orders: "Đơn nạp", transactions: "Lịch sử", events: "SePay / Đối soát" }[kind]}</FinanceChip>)}</View>
      <View style={styles.wrap}>{["", ...(f.kind === "orders" ? ["pending", "success", "rejected"] : f.kind === "events" ? ["review", "credited", "already_processed"] : ["topup", "purchase", "adjustment"])].map((value) =>
        <FinanceChip key={value} tone={value ? toneFor(value) : tones.green} selected={f.filter === value} disabled={f.busy} onPress={() => f.selectFilter(value)}>{labels[value] || "Tất cả"}</FinanceChip>)}</View>
      <Button disabled={f.busy} onPress={f.refresh} icon="refresh">Tải lại</Button>
      {!f.loading && !f.list.items.length && <Text>Chưa có giao dịch trong mục này.</Text>}
      {f.list.items.map((item) => {
        const status = item.expired ? "expired" : item.status;
        const tone = toneFor(f.kind === "transactions" ? item.type : status);
        const statusTone = status ? toneFor(status) : tone;
        return <Card key={item._id} mode="outlined" style={[styles.card, styles.transactionCard, { backgroundColor: tone.background, borderColor: tone.border, borderLeftColor: tone.text }]}><Card.Content style={styles.transactionContent}>
        <View style={styles.transactionHeading}>
          <View style={[styles.transactionIcon, { backgroundColor: tone.border }]}><Icon source={tone.icon} color={tone.text} size={18} /></View>
          <Text variant="titleMedium" style={[styles.flex, styles.transactionTitle, { color: tone.text }]}>{item.code || labels[item.type] || `SePay #${item.provider_id}`} {item.plan || ""}</Text>
        </View>
        <View style={styles.row}>
          <Text variant="headlineSmall" style={[styles.transactionAmount, { color: tone.text }]}>{f.kind === "transactions" && item.amount > 0 ? "+" : ""}{money(item.amount)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusTone.border }]}><Text style={[styles.statusText, { color: statusTone.text }]}>{labels[status] || "Đã ghi nhận"}</Text></View>
        </View>
        <Text style={styles.secondaryText}>{date(item.createdAt || item.created_at)}</Text>
        {admin && <Text selectable>User: {item.user_id || "Chưa xác định"}</Text>}
        {item.balance_after !== undefined && <View style={[styles.balanceRow, { borderTopColor: tone.border }]}><Text style={styles.secondaryText}>Số dư sau giao dịch</Text><Text style={styles.balanceValue}>{money(item.balance_after)}</Text></View>}
        {!!item.reason && <Text>{item.reason}</Text>}
        {admin && item.actor_id && <Text selectable>Người thực hiện: {item.actor_id}</Text>}
        {admin && item.reviewed_by && <Text selectable>Admin: {item.reviewed_by}</Text>}
        {f.kind === "events" && <Text selectable>{item.content}</Text>}
        {admin && f.kind === "orders" && item.status === "pending" && <View style={styles.row}>
          <Button disabled={f.busy} onPress={() => { setReason(""); setDialog({ id: item._id, status: "success", amount: item.amount }); }}>Duyệt cộng ví</Button>
          <Button disabled={f.busy} textColor="#B42318" onPress={() => { setReason(""); setDialog({ id: item._id, status: "rejected" }); }}>Từ chối</Button>
        </View>}
        {!admin && f.kind === "orders" && <Button disabled={f.busy} onPress={() => { f.openOrder(item); setDialog({ view: item }); }}>Xem đơn</Button>}
      </Card.Content></Card>;
      })}
      <View style={styles.row}><Button disabled={f.page <= 1 || f.busy} onPress={() => f.changePage(f.page - 1)}>Trước</Button>
        <Text>Trang {f.page}/{Math.max(1, f.list.totalPages)}</Text>
        <Button disabled={f.page >= f.list.totalPages || f.busy} onPress={() => f.changePage(f.page + 1)}>Sau</Button></View>
      </>}
    </ScrollView>
    <Portal><Dialog visible={!!dialog} onDismiss={() => { if (!f.busy) setDialog(null); }}>
      <Dialog.Title>{dialog?.view ? "Chi tiết đơn nạp" : "Xác nhận giao dịch"}</Dialog.Title>
      <Dialog.ScrollArea><ScrollView contentContainerStyle={styles.gap}>
        {dialog?.view ? <>
          <Text selectable>{viewedOrder.code}</Text><Text>{money(viewedOrder.amount)} · {labels[viewedOrder.expired ? "expired" : viewedOrder.status]}</Text>
          <Text>Hạn: {date(viewedOrder.expires_at)}</Text>
          {viewedOrder.status === "pending" && !viewedOrder.expired && f.remainingSeconds > 0 && <>
            {viewedOrder.qr_url && <Image source={{ uri: viewedOrder.qr_url }} style={styles.qr} resizeMode="contain" />}
            <Text selectable>{viewedOrder.bank_code} · {viewedOrder.account_number} · {viewedOrder.account_name}</Text>
            <Text selectable>Nội dung: {viewedOrder.code}</Text>
          </>}
        </> : <>
          <Text>{dialog?.plan ? `Mua ${dialog.plan.code}: ${money(dialog.plan.price)}, ${dialog.plan.days} ngày. Tiền sẽ trừ vào ví ngay sau khi xác nhận.` : dialog?.adjust ? `Cộng ${money(amount)} cho ${customer?.email}. Đây là điều chỉnh riêng, không xác nhận đơn SePay.` : dialog?.status === "success" ? `Duyệt cộng ${money(dialog.amount)} vào ví. Đảm bảo đã kiểm tra chứng từ.` : "Từ chối đơn nạp. Đơn đã kết thúc không thể sửa lại."}</Text>
          {!dialog?.plan && <TextInput mode="outlined" multiline label="Lý do bắt buộc (5–500 ký tự)" value={reason} onChangeText={setReason} maxLength={500} disabled={f.busy} />}
          <Text>{f.message}</Text>
        </>}
      </ScrollView></Dialog.ScrollArea>
      <Dialog.Actions><Button disabled={f.busy} onPress={() => setDialog(null)}>Đóng</Button>
        {!dialog?.view && <Button loading={f.busy} disabled={f.busy || (!dialog?.plan && reason.trim().length < 5)} onPress={confirm}>Xác nhận</Button>}</Dialog.Actions>
    </Dialog></Portal>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F9F6" }, header: { padding: 14, gap: 6 },
  content: { padding: 18, gap: 14, paddingBottom: 40, maxWidth: 900, width: "100%", alignSelf: "center" },
  heading: { fontWeight: "800", color: "#144D37" }, hero: { borderRadius: 26, padding: 26, gap: 9 },
  heroTitle: { color: "#F8D884", fontSize: 23, fontWeight: "800" }, light: { color: "#E2F1E7" },
  balance: { color: "white", fontSize: 32, fontWeight: "800" }, card: { backgroundColor: "white", borderRadius: 20 },
  gap: { gap: 12, paddingVertical: 12 }, row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, flex: { flex: 1, minWidth: 150 },
  notice: { color: "#805A13", backgroundColor: "#FFF5DB", padding: 12, borderRadius: 12 },
  qr: { width: "100%", height: 240 },
  filterChip: { borderWidth: 1, borderRadius: 24 },
  transactionCard: { borderWidth: 1, borderLeftWidth: 4, borderRadius: 14 },
  transactionContent: { gap: 6, paddingHorizontal: 12, paddingVertical: 10 },
  transactionHeading: { flexDirection: "row", alignItems: "center", gap: 8 },
  transactionIcon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  transactionTitle: { fontSize: 14, lineHeight: 20, fontWeight: "700", flexShrink: 1, minWidth: 0 },
  transactionAmount: { fontSize: 18, lineHeight: 24, fontWeight: "800" },
  statusBadge: { borderRadius: 14, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 1 },
  statusText: { fontSize: 12, fontWeight: "700" },
  secondaryText: { color: "#52645D", fontSize: 13 },
  balanceRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 6, borderTopWidth: 1, paddingTop: 6 },
  balanceValue: { color: "#183B2B", fontWeight: "700" },
});
