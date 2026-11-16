import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import useDiagnosisHistoryDetail from "../../src/hooks/useDiagnosisHistoryDetail";
import DiagnosisHistoryPhoto from "../../src/components/diagnosis/DiagnosisHistoryPhoto";
import ListError from "../../src/components/common/ListError";
import { colors, spacing } from "../../src/theme";

export default function DiagnosisDetailScreen() {
  const params = useLocalSearchParams(),
    router = useRouter();
  const id = typeof params.diagnosisId === "string" ? params.diagnosisId : "";
  const detail = useDiagnosisHistoryDetail(id);
  if (!detail.enabled) return null;
  const record = detail.data;
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          accessibilityLabel="Quay lại lịch sử chẩn đoán"
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace("/customer/diagnosis-history")
          }
        />
        <Text variant="titleLarge">Chi tiết chẩn đoán</Text>
      </View>
      {detail.loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text>Đang tải chẩn đoán...</Text>
        </View>
      ) : detail.error ? (
        <View style={styles.center}>
          <ListError message={detail.error} onRetry={detail.retry} />
        </View>
      ) : (
        record && (
          <ScrollView contentContainerStyle={styles.content}>
            <DiagnosisHistoryPhoto
              diagnosisId={record._id}
              hasImage={record.has_image}
              large
            />
            <Text variant="headlineSmall">
              {record.disease_name || "Thông tin bệnh không còn khả dụng"}
            </Text>
            <Text variant="titleMedium">
              Cây: {record.plant_name || "Thông tin cây không còn khả dụng"}
            </Text>
            <Text style={styles.secondary}>
              {record.created_at
                ? new Date(record.created_at).toLocaleString("vi-VN")
                : "Chưa có thời gian"}
            </Text>
            <Text style={styles.secondary}>Kết quả chẩn đoán đã được lưu.</Text>
          </ScrollView>
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center" },
  content: { padding: spacing.lg, gap: spacing.lg },
  secondary: { color: colors.textSecondary },
  center: {
    flex: 1,
    padding: spacing.xl,
    gap: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
