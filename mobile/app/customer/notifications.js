import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Icon, IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import useNotifications from "../../src/hooks/useNotifications";
import ListPagination from "../../src/components/common/ListPagination";
import { colors } from "../../src/theme/colors";
import notificationService from "../../src/services/notificationService";
import useScreenScope from "../../src/hooks/useScreenScope";
import { notificationRoute } from "../../src/utils/notificationRoute";

const scheduleDate = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit",
});
const scheduleTime = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

export default function NotificationsScreen() {
  const router = useRouter();
  const notifications = useNotifications();
  const scope = useScreenScope();
  const actionsDisabled = !!notifications.busyId || notifications.markingAll || notifications.refreshing;
  const open = async (item) => {
    const current = scope.capture();
    if (!(await notifications.markRead(item)) || !current()) return;
    try {
      const { data } = await notificationService.detail(item._id);
      const route = notificationRoute(data);
      if (current() && typeof route === "object") router.push(route);
    } catch {
      // Keep the inbox open if the target disappeared.
    }
  };
  return <SafeAreaView style={styles.screen}>
    <View style={styles.header}>
      <IconButton icon="arrow-left" accessibilityLabel="Quay lại" onPress={() => router.canGoBack() ? router.back() : router.replace("/customer/home")} />
      <Text variant="titleLarge">Thông báo</Text>
      <Button compact mode="contained" style={styles.readAll} labelStyle={styles.readAllLabel}
        disabled={actionsDisabled || notifications.loading} loading={notifications.markingAll} onPress={notifications.markAllRead}>
        Đánh dấu đã đọc tất cả
      </Button>
    </View>
    <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={notifications.refreshing} onRefresh={notifications.refresh} />}>
      {notifications.loading ? <ActivityIndicator /> : notifications.error ? <>
        <Text accessibilityRole="alert">{notifications.error}</Text>
        <Button onPress={notifications.retry}>Thử lại</Button>
      </> : <>
        {!notifications.items.length && <Text>Bạn chưa có thông báo đến hạn.</Text>}
        {!!notifications.actionError && <Text accessibilityRole="alert">{notifications.actionError}</Text>}
        {notifications.items.map(item => {
          const isCare = item.type === "care";
          const scheduledFor = new Date(item.scheduled_for);
          return <Card key={item._id} mode="outlined" style={[styles.card, !item.is_read && styles.unreadCard]}>
            <View style={styles.cardBody}>
              <View style={styles.cardHeading}>
                <View style={[styles.iconTile, !isCare && styles.treatmentTile]}>
                  <Icon source={isCare ? "sprout-outline" : "medical-bag"} size={17} color={colors.primary} />
                </View>
                <View style={styles.headingText}>
                  <Text variant="titleMedium" style={styles.title}>{item.title}</Text>
                  <Text variant="bodyMedium" style={styles.message}>{item.message}</Text>
                  {!Number.isNaN(scheduledFor.getTime()) && <View style={styles.metadata}>
                    <Icon source="clock-outline" size={14} color={colors.textSecondary} />
                    <Text variant="bodySmall" style={styles.secondaryText}>
                      {scheduleDate.format(scheduledFor)} · {scheduleTime.format(scheduledFor)}
                    </Text>
                  </View>}
                </View>
                <Text variant="labelSmall" style={[styles.status, !item.is_read && styles.unreadStatus]}>
                  {item.is_read ? "Đã đọc" : "Chưa đọc"}
                </Text>
              </View>
              <View style={styles.actions}>
                {!item.is_read && <IconButton mode="outlined" icon="check" size={20} style={styles.actionButton}
                  accessibilityLabel="Đánh dấu đã đọc" disabled={actionsDisabled} loading={notifications.busyId === item._id}
                  onPress={() => notifications.markRead(item)} />}
                <IconButton mode="contained" icon="calendar-outline" size={20} style={styles.actionButton}
                  accessibilityLabel={isCare ? "Xem lịch chăm sóc" : "Xem lịch điều trị"}
                  disabled={actionsDisabled} onPress={() => open(item)} />
              </View>
            </View>
          </Card>;
        })}
        <ListPagination pagination={notifications.pagination} onPageChange={notifications.load} disabled={actionsDisabled} />
      </>}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", paddingRight: 12 },
  readAll: { marginLeft: "auto", flexShrink: 1, borderRadius: 20 },
  readAllLabel: { fontSize: 12, marginHorizontal: 10 },
  content: { padding: 18, gap: 16 },
  card: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: 20 },
  unreadCard: { backgroundColor: colors.softSproutBg, borderColor: colors.primaryLight },
  cardBody: { paddingHorizontal: 10, paddingVertical: 8, gap: 6 },
  cardHeading: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  iconTile: { width: 26, height: 26, borderRadius: 9, backgroundColor: colors.lightMint, alignItems: "center", justifyContent: "center" },
  treatmentTile: { backgroundColor: colors.softPurpleBg },
  headingText: { flex: 1, gap: 4 },
  title: { color: colors.primaryText, fontWeight: "700", fontSize: 14, lineHeight: 18 },
  message: { color: colors.textPrimary },
  secondaryText: { color: colors.textSecondary, flexShrink: 1 },
  metadata: { flexDirection: "row", alignItems: "center", gap: 5 },
  status: { backgroundColor: colors.borderLight, color: colors.textSecondary, paddingHorizontal: 6, borderRadius: 12 },
  unreadStatus: { backgroundColor: colors.lightMint, color: colors.primary },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  actionButton: { width: 44, height: 44, borderRadius: 22, margin: 0 },
});
