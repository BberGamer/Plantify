import ScreenHeader from "../common/ScreenHeader";
import { colors } from "../../theme";
import { ScrollView, View } from "react-native";
import { ActivityIndicator, Icon, List, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import useFinanceScreen from "../../hooks/useFinanceScreen";
import { money, date, styles } from "./finance/presentation";
import VipSection from "./finance/VipSection";
import WalletSection from "./finance/WalletSection";
import AdminAdjustment from "./finance/AdminAdjustment";
import HistorySection from "./finance/HistorySection";
import FinanceDialogs from "./finance/FinanceDialogs";

const VIP_SHORTCUTS = [
  { title: "Đến ví tiền", description: "Nạp tiền và kiểm tra số dư", icon: "wallet-outline", path: "/customer/wallet", background: colors.lightMint },
  { title: "Về hồ sơ của tôi", description: "Xem thông tin tài khoản", icon: "account-outline", path: "/customer/profile", background: colors.white },
  { title: "Lịch sử giao dịch", description: "Xem đơn nạp và các lần mua VIP", icon: "history", path: "/customer/transactions", background: colors.softSproutBg },
];

export default function FinanceScreen({ admin = false, section = "vip" }) {
  const {
    f,
    router,
    topupField,
    amount,
    setAmount,
    dialog,
    setDialog,
    reason,
    setReason,
    validationError,
    setValidationError,
    search,
    setSearch,
    customers,
    customer,
    setCustomer,
    searchError,
    findCustomers,
    viewedOrder,
    confirm,
  } = useFinanceScreen(admin, section);
  const showVip = !admin && section === "vip";
  const showWallet = !admin && section === "wallet";
  const showHistory = admin || section === "history";
  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title={admin ? "Quản lý tài chính" : {
        vip: "Tài khoản VIP", wallet: "Ví tiền", history: "Lịch sử giao dịch",
      }[section]} onBack={admin ? undefined : () => {
        if (router.canGoBack()) router.back();
        else router.replace("/customer/profile");
      }} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {!admin && !showHistory && (
          <LinearGradient colors={[colors.primaryDark, colors.primaryLight]} style={styles.hero}>
            <Icon
              source={showVip ? "crown" : "wallet-outline"}
              color="#F8D884"
              size={30}
            />
            <Text style={styles.heroTitle}>
              {showWallet
                ? "Ví Plantify của bạn"
                : !f.summary
                  ? "Thông tin gói tài khoản"
                  : f.summary.isproaccount
                    ? `Plantify ${f.summary.vip_plan}`
                    : "Tài khoản Free"}
            </Text>
            <Text style={styles.light}>Số dư ví</Text>
            <Text style={styles.balance}>
              {f.summary ? money(f.summary.balance) : "—"}
            </Text>
            {showVip && f.summary?.isproaccount && (
              <Text style={styles.light}>
                Hết hạn:{" "}
                {date(
                  new Date(new Date(f.summary.vip_expires_at).getTime() - 1),
                )}
              </Text>
            )}
            {showVip && f.summary && (
              <Text style={styles.light}>
                {f.summary.isproaccount
                  ? "VIP còn hạn: được nhận diện, chẩn đoán AI và không giới hạn cây trong vườn, cây yêu thích."
                  : "Mua gói VIP để mở rộng quyền lợi."}
              </Text>
            )}
            {showWallet && (
              <Text style={styles.light}>
                Nạp tiền để mua gói VIP. Nạp ví không tự kích hoạt hoặc gia hạn
                VIP.
              </Text>
            )}
          </LinearGradient>
        )}
        {!!f.message && (
          <Text accessibilityRole="alert" style={styles.notice}>
            {f.message}
          </Text>
        )}
        {f.loading && <ActivityIndicator />}
        {showVip && <VipSection f={f} router={router} setDialog={setDialog} />}
        {showWallet && (
          <WalletSection
            f={f}
            amount={amount}
            setAmount={setAmount}
            topupField={topupField}
            setValidationError={setValidationError}
          />
        )}
        {!admin && !showHistory && (
          <View style={styles.shortcuts}>
            {(showVip ? VIP_SHORTCUTS : VIP_SHORTCUTS.slice(2)).map((item) => (
              <List.Item key={item.path} title={item.title} description={item.description}
                disabled={f.busy} onPress={() => router.navigate(item.path)}
                style={[styles.shortcut, { backgroundColor: item.background }]}
                titleStyle={styles.shortcutTitle} descriptionStyle={styles.secondaryText}
                descriptionNumberOfLines={2}
                left={(props) => <List.Icon {...props} icon={item.icon} color={colors.primary} />}
                right={(props) => <List.Icon {...props} icon="chevron-right" color={colors.primary} />} />
            ))}
          </View>
        )}
        {admin && (
          <AdminAdjustment
            f={f}
            search={search}
            setSearch={setSearch}
            setCustomer={setCustomer}
            findCustomers={findCustomers}
            searchError={searchError}
            customers={customers}
            customer={customer}
            amount={amount}
            setAmount={setAmount}
            setValidationError={setValidationError}
            setReason={setReason}
            setDialog={setDialog}
          />
        )}
        {showHistory && (
          <HistorySection
            f={f}
            admin={admin}
            setReason={setReason}
            setDialog={setDialog}
          />
        )}
      </ScrollView>
      <FinanceDialogs
        dialog={dialog}
        validationError={validationError}
        f={f}
        viewedOrder={viewedOrder}
        amount={amount}
        customer={customer}
        reason={reason}
        setReason={setReason}
        setDialog={setDialog}
        confirm={confirm}
        setValidationError={setValidationError}
      />
    </SafeAreaView>
  );
}
