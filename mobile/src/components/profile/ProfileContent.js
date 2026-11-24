import { ScrollView, StyleSheet, View } from "react-native";
import { List, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileHeader from "./ProfileHeader";
import ProfileIdentity from "./ProfileIdentity";
import ProfileDetails from "./ProfileDetails";
import ProfileLogout from "./ProfileLogout";
import Navbar from "../navigation/Navbar";
import useProfile from "../../hooks/useProfile";
import { colors } from "../../theme/colors";
import { useFinanceSummary } from "../../hooks/useFinance";

export default function ProfileContent({
  onBack,
  showNavbar = false,
  onOpenFavorites,
  onOpenFinance,
  onOpenDiagnosisHistory,
  onOpenFeedback,
}) {
  const profile = useProfile();
  const finance = useFinanceSummary(profile.user?.role === "customer");

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={
        showNavbar
          ? ["top", "left", "right"]
          : ["top", "left", "right", "bottom"]
      }
    >
      <ProfileHeader onBack={onBack} />
      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          showNavbar && styles.navContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ProfileIdentity user={profile.user} finance={finance} />
        <ProfileDetails
          user={profile.user}
          editing={profile.editing}
          isLoggingOut={profile.isLoggingOut}
          startEditing={profile.startEditing}
          message={profile.message}
          form={profile.form}
          changeField={profile.changeField}
          saving={profile.saving}
          cancelEditing={profile.cancelEditing}
          saveProfile={profile.saveProfile}
        />
        {(onOpenDiagnosisHistory || onOpenFeedback) && (
          <View style={styles.favorites}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Chẩn đoán bệnh cây và phản hồi
            </Text>
            {onOpenDiagnosisHistory && (
              <List.Item
                title="Lịch sử nhận diện & chẩn đoán"
                description="Xem cây và bệnh đã nhận diện, kèm ảnh đã lưu"
                onPress={onOpenDiagnosisHistory}
                disabled={profile.isLoggingOut}
                style={styles.favoriteLink}
                left={(props) => (
                  <List.Icon {...props} icon="history" color={colors.primary} />
                )}
                right={(props) => (
                  <List.Icon
                    {...props}
                    icon="chevron-right"
                    color={colors.primary}
                  />
                )}
              />
            )}
            {onOpenFeedback && (
              <List.Item
                title="Đóng góp ý kiến"
                onPress={onOpenFeedback}
                disabled={profile.isLoggingOut}
                style={styles.favoriteLink}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="message-text-outline"
                    color={colors.primary}
                  />
                )}
                right={(props) => (
                  <List.Icon
                    {...props}
                    icon="chevron-right"
                    color={colors.primary}
                  />
                )}
              />
            )}
          </View>
        )}
        {onOpenFavorites && (
          <View style={styles.favorites}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Cây yêu thích
            </Text>
            <List.Item
              title="Cây yêu thích của tôi"
              onPress={onOpenFavorites}
              disabled={profile.isLoggingOut}
              style={styles.favoriteLink}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="heart-outline"
                  color={colors.primary}
                />
              )}
              right={(props) => (
                <List.Icon
                  {...props}
                  icon="chevron-right"
                  color={colors.primary}
                />
              )}
            />
          </View>
        )}
        {onOpenFinance && (
          <View style={styles.favorites}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Tài khoản VIP và Tài chính
            </Text>
            <List.Item
              title="Tài khoản VIP"
              description={
                !finance
                  ? "Xem thông tin gói tài khoản"
                  : finance.isproaccount
                    ? `Đang sử dụng ${finance.vip_plan}`
                    : "Đang dùng Free · Mua gói VIP để mở rộng quyền lợi"
              }
              onPress={() => onOpenFinance("vip")}
              disabled={profile.isLoggingOut}
              style={styles.favoriteLink}
              left={(props) => (
                <List.Icon {...props} icon="crown-outline" color="#A47820" />
              )}
              right={(props) => (
                <List.Icon
                  {...props}
                  icon="chevron-right"
                  color={colors.primary}
                />
              )}
            />
            <List.Item
              title="Ví tiền"
              description={
                finance
                  ? `Số dư: ${finance.balance.toLocaleString("vi-VN")} ₫`
                  : "Số dư và nạp tiền"
              }
              onPress={() => onOpenFinance("wallet")}
              disabled={profile.isLoggingOut}
              style={styles.favoriteLink}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="wallet-outline"
                  color={colors.primary}
                />
              )}
              right={(props) => (
                <List.Icon
                  {...props}
                  icon="chevron-right"
                  color={colors.primary}
                />
              )}
            />
            <List.Item
              title="Lịch sử giao dịch"
              description="Đơn nạp, mua VIP và các thay đổi số dư"
              onPress={() => onOpenFinance("history")}
              disabled={profile.isLoggingOut}
              style={styles.favoriteLink}
              left={(props) => (
                <List.Icon {...props} icon="history" color={colors.primary} />
              )}
              right={(props) => (
                <List.Icon
                  {...props}
                  icon="chevron-right"
                  color={colors.primary}
                />
              )}
            />
          </View>
        )}
        <ProfileLogout
          isLoggingOut={profile.isLoggingOut}
          saving={profile.saving}
          logoutError={profile.logoutError}
          handleLogout={profile.handleLogout}
        />
      </ScrollView>
      {showNavbar && <Navbar />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  favorites: { marginTop: 20, marginBottom: 8, gap: 10 },
  sectionTitle: { color: colors.textPrimary, fontWeight: "700" },
  favoriteLink: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
  },
  safeArea: { flex: 1, backgroundColor: colors.white },
  scroll: { flex: 1 },
  navContent: { paddingBottom: 40 },
  content: { padding: 18, paddingBottom: 28, backgroundColor: "#FAFCFA" },
});
