import { ScrollView, View } from "react-native";
import { ActivityIndicator, Button, Icon, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import useFinanceScreen from "../../hooks/useFinanceScreen";
import { money, date, styles } from "./finance/presentation";
import VipSection from "./finance/VipSection";
import WalletSection from "./finance/WalletSection";
import AdminAdjustment from "./finance/AdminAdjustment";
import HistorySection from "./finance/HistorySection";
import FinanceDialogs from "./finance/FinanceDialogs";

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
      <View style={styles.header}>
        {!admin && (
          <Button onPress={() => router.back()} icon="arrow-left">
            Quay lại
          </Button>
        )}
        <Text variant="titleLarge" style={styles.heading}>
          {admin
            ? "Quản lý tài chính"
            : {
                vip: "Tài khoản VIP",
                wallet: "Ví tiền",
                history: "Lịch sử giao dịch",
              }[section]}
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {!admin && !showHistory && (
          <LinearGradient colors={["#103B2D", "#247855"]} style={styles.hero}>
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
                  : "Free: tối đa 3 cây trong vườn, 5 cây yêu thích; chưa được nhận diện hoặc chẩn đoán AI. Mua gói VIP để mở rộng quyền lợi."}
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
          <Button
            icon="history"
            disabled={f.busy}
            onPress={() => router.push("/customer/transactions")}
          >
            Xem lịch sử giao dịch
          </Button>
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
