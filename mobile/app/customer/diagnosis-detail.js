import ScreenHeader from "../../src/components/common/ScreenHeader";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Chip, Text } from "react-native-paper";
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
  const isPlant = record?.result_kind === "plant";
  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader
        title={isPlant ? "Chi tiết nhận diện cây" : "Chi tiết chẩn đoán bệnh"}
        backLabel="Quay lại lịch sử nhận diện và chẩn đoán"
        onBack={() =>
          router.canGoBack()
            ? router.back()
            : router.replace("/customer/diagnosis-history")
        }
      />
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
            <Chip
              icon={isPlant ? "leaf-outline" : "stethoscope"}
              style={styles.kind}
            >
              {isPlant ? "Nhận diện cây" : "Chẩn đoán bệnh"}
            </Chip>
            <DiagnosisHistoryPhoto
              diagnosisId={record._id}
              hasImage={record.has_image}
              large
            />
            <Text variant="headlineSmall">
              {isPlant
                ? record.plant_name || "Thông tin cây không còn khả dụng"
                : record.disease_name || "Thông tin bệnh không còn khả dụng"}
            </Text>
            {!isPlant && (
              <Text variant="titleMedium">
                Cây: {record.plant_name || "Thông tin cây không còn khả dụng"}
              </Text>
            )}
            <Text style={styles.secondary}>
              {record.created_at
                ? new Date(record.created_at).toLocaleString("vi-VN")
                : "Chưa có thời gian"}
            </Text>
            <Text style={styles.secondary}>
              {isPlant
                ? "Kết quả nhận diện tên cây đã được lưu. Lần nhận diện này không kết luận tình trạng bệnh."
                : "Kết quả chẩn đoán bệnh đã được lưu."}
            </Text>
          </ScrollView>
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    padding: 20,
    gap: spacing.lg,
  },
  kind: {
    alignSelf: "flex-start",
    backgroundColor: colors.lightMint,
  },
  secondary: {
    color: colors.textSecondary,
  },
  center: {
    flex: 1,
    padding: spacing.xl,
    gap: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
