import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Chip, IconButton, SegmentedButtons, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import useAuthStore from "../../store/authStore";
import useDiagnosisHistoryList from "../../src/hooks/useDiagnosisHistoryList";
import ListError from "../../src/components/common/ListError";
import ListPagination from "../../src/components/common/ListPagination";
import Navbar from "../../src/components/navigation/Navbar";
import DiagnosisHistoryPhoto from "../../src/components/diagnosis/DiagnosisHistoryPhoto";
import { colors, spacing } from "../../src/theme";

const formatTime = value => value ? new Date(value).toLocaleString("vi-VN", {
  year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
}) : "Chưa có thời gian";

export default function DiagnosisHistoryScreen() {
  const router = useRouter();
  const enabled = useAuthStore(state => state.isAuthenticated && state.user?.role === "customer");
  const { kind, setKind, history } = useDiagnosisHistoryList({ limit: 20, enabled });
  if (!enabled) return null;
  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" accessibilityLabel="Quay lại"
          onPress={() => router.canGoBack() ? router.back() : router.replace("/customer/profile")} />
        <Text variant="titleLarge" style={styles.title}>Lịch sử nhận diện & chẩn đoán</Text>
        <IconButton icon="camera-outline" accessibilityLabel="Chẩn đoán mới"
          onPress={() => router.push("/customer/diagnosis")} />
      </View>
      <Text style={styles.summary}>Các kết quả nhận diện cây và chẩn đoán bệnh đã được chấp nhận và lưu.</Text>
      <SegmentedButtons value={kind} onValueChange={setKind} style={styles.filters}
        buttons={[
          { value: "all", label: "Tất cả" },
          { value: "plant", label: "Nhận diện cây" },
          { value: "disease", label: "Bệnh cây" },
        ]} />
      {history.loading ? (
        <View style={styles.center}><ActivityIndicator /><Text>Đang tải lịch sử chẩn đoán...</Text></View>
      ) : history.error ? (
        <View style={styles.center}><ListError message={history.error} onRetry={history.retry} /></View>
      ) : (
        <FlatList data={history.items} keyExtractor={item => item._id}
          contentContainerStyle={styles.content} refreshing={history.refreshing} onRefresh={history.refresh}
          renderItem={({ item }) => (
            <Card style={styles.card} accessibilityLabel={item.result_kind === "plant" ? "Xem chi tiết nhận diện cây" : "Xem chi tiết chẩn đoán bệnh"}
              onPress={() => router.push({ pathname: "/customer/diagnosis-detail", params: { diagnosisId: item._id } })}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardText}>
                <Chip icon={item.result_kind === "plant" ? "leaf-outline" : "stethoscope"}
                  style={[styles.kind, item.result_kind !== "plant" && styles.diseaseKind]}>
                  {item.result_kind === "plant" ? "Nhận diện cây" : "Chẩn đoán bệnh"}
                </Chip>
                <Text variant="titleMedium">{item.result_kind === "plant"
                  ? item.plant_name || "Thông tin cây không còn khả dụng"
                  : item.disease_name || "Thông tin bệnh không còn khả dụng"}</Text>
                {item.result_kind !== "plant" && <Text>{item.plant_name || "Thông tin cây không còn khả dụng"}</Text>}
                <Text style={styles.time}>{formatTime(item.created_at)}</Text>
                </View>
                <DiagnosisHistoryPhoto diagnosisId={item._id} hasImage={item.has_image} />
              </Card.Content>
            </Card>
          )}
          ListEmptyComponent={history.refreshing ? <ActivityIndicator /> : (
            <View style={styles.center}>
              <Text>{kind === "plant" ? "Chưa có lịch sử nhận diện cây." : kind === "disease" ? "Chưa có lịch sử chẩn đoán bệnh." : "Chưa có lịch sử nhận diện hoặc chẩn đoán."}</Text>
              <Button mode="contained" icon="camera-outline" onPress={() => router.push(kind === "disease" ? "/customer/diagnosis" : "/customer/identification")}>
                {kind === "disease" ? "Chẩn đoán bệnh" : "Nhận diện cây"}
              </Button>
            </View>
          )}
          ListFooterComponent={<ListPagination pagination={history.pagination} onPageChange={history.load} disabled={history.refreshing} />}
        />
      )}
      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", backgroundColor: colors.white },
  title: { flex: 1, color: colors.textPrimary, fontWeight: "700" },
  summary: { padding: spacing.lg, color: colors.textSecondary },
  filters: { marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  kind: { alignSelf: "flex-start", backgroundColor: colors.lightMint },
  diseaseKind: { backgroundColor: "#FFF3DF" },
  content: { padding: spacing.lg, paddingBottom: spacing.xl, flexGrow: 1 },
  card: { marginBottom: spacing.md, backgroundColor: colors.white },
  cardContent: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  cardText: { flex: 1, gap: spacing.sm },
  time: { color: colors.textSecondary },
  center: { flex: 1, padding: spacing.xl, gap: spacing.md, justifyContent: "center", alignItems: "center" },
});
