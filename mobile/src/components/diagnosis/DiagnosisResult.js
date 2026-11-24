import { Image, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { colors, spacing, typography } from "../../theme";
import DiseaseDetails from "./DiseaseDetails";

export default function DiagnosisResult({
  photo,
  result,
  onRetake,
  onImageError,
  onCreateTreatment,
}) {
  const status = result.result_status;
  const identified = status === "accepted" && !!result.prediction;
  const prediction = identified ? result.prediction : null;
  const hasDisease = !!prediction && !prediction.is_healthy;
  const canCreateTreatment =
    hasDisease &&
    prediction.treatment_available === true &&
    !!result.diagnosis_id &&
    !!prediction.plant_id &&
    !!prediction.disease_id;
  const title = identified
    ? prediction.is_healthy
      ? "Chưa phát hiện bệnh trong phạm vi hỗ trợ"
      : prediction.disease_name
    : "Chưa chẩn đoán được";

  return (
    <View style={styles.card}>
      {status !== "invalid_image" && (
        <Image
          source={{ uri: photo.uri }}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel="Ảnh cây đã phân tích"
          onError={onImageError}
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {hasDisease && <DiseaseDetails disease={prediction.disease_details} />}
        {!identified && (
          <Text style={styles.body} accessibilityRole="alert">
            {result.message}
          </Text>
        )}
        <View style={styles.actions}>
          {hasDisease && (
            <Button
              mode="contained"
              icon="clipboard-pulse-outline"
              disabled={!canCreateTreatment}
              onPress={canCreateTreatment ? onCreateTreatment : undefined}
            >
              Tạo phác đồ điều trị
            </Button>
          )}
          <Button mode="contained" icon="camera-outline" onPress={onRetake}>
            {identified ? "Chụp / chọn ảnh mới" : "Chụp lại"}
          </Button>
        </View>
        {hasDisease && !canCreateTreatment && (
          <Text style={styles.body}>
            {prediction.treatment_available !== true
              ? "Chưa có phác đồ điều trị đã được phê duyệt cho kết quả này."
              : "Kết quả chưa đủ dữ liệu để tạo phác đồ điều trị."}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, overflow: "hidden", backgroundColor: colors.white },
  image: { width: "100%", aspectRatio: 1.4, backgroundColor: "#10231D" },
  content: { padding: spacing.xl, gap: spacing.md },
  title: { ...typography.title, color: colors.textPrimary },
  body: { ...typography.body, color: colors.textSecondary },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
