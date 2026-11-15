import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import useNotifications from "../../src/hooks/useNotifications";
import ListPagination from "../../src/components/common/ListPagination";
import { colors } from "../../src/theme/colors";

export default function NotificationsScreen() {
  const router = useRouter();
  const notifications = useNotifications();
  const open = async (item) => {
    if (await notifications.markRead(item)) router.push({
      pathname: "/customer/treatments/TreatmentList",
      params: { treatmentId: item.treatment_schedule_id },
    });
  };
  return <SafeAreaView style={styles.screen}>
    <View style={styles.header}>
      <IconButton icon="arrow-left" accessibilityLabel="Quay lại" onPress={() => router.canGoBack() ? router.back() : router.replace("/customer/home")} />
      <Text variant="titleLarge">Thông báo</Text>
    </View>
    <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={notifications.refreshing} onRefresh={notifications.refresh} />}>
      {notifications.loading ? <ActivityIndicator /> : notifications.error ? <>
        <Text accessibilityRole="alert">{notifications.error}</Text>
        <Button onPress={notifications.retry}>Thử lại</Button>
      </> : <>
        {!notifications.items.length && <Text>Bạn chưa có thông báo nhắc điều trị đến hạn.</Text>}
        {!!notifications.actionError && <Text accessibilityRole="alert">{notifications.actionError}</Text>}
        {notifications.items.map(item => <Card key={item._id} style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">{!item.is_read ? "● " : ""}{item.title}</Text>
            <Text>{item.message}</Text>
            <Text>{new Date(item.scheduled_for).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</Text>
            <Text>{item.is_read ? "Đã đọc" : "Chưa đọc"}</Text>
          </Card.Content>
          <Card.Actions>
            {!item.is_read && <Button disabled={!!notifications.busyId || notifications.refreshing} loading={notifications.busyId === item._id} onPress={() => notifications.markRead(item)}>Đánh dấu đã đọc</Button>}
            <Button disabled={!!notifications.busyId || notifications.refreshing} onPress={() => open(item)}>Xem lịch điều trị</Button>
          </Card.Actions>
        </Card>)}
        <ListPagination pagination={notifications.pagination} onPageChange={notifications.load} disabled={!!notifications.busyId || notifications.refreshing} />
      </>}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center" },
  content: { padding: 18, gap: 16 },
  card: { backgroundColor: colors.white },
});
