import { Image, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "../../theme";

const RETAKE_TIPS = [
  "Chụp một cây hoặc một lá, lấy rõ cả vùng có dấu hiệu bất thường.",
  "Giữ máy ổn định, lau ống kính và dùng ánh sáng tự nhiên; tránh ảnh cháy sáng hoặc quá tối.",
  "Đổi góc chụp hoặc chụp gần hơn, không dùng bộ lọc màu.",
];
const scoreText = (score) => `${(score * 100).toFixed(1)}%`;

export default function DiagnosisResult({
  photo,
  result,
  onBack,
  onRetake,
  onImageError,
}) {
  const identified = result.status === "identified";
  const uncertain = result.status === "uncertain";
  const prediction = identified ? result.prediction : null;
  const title = identified
    ? prediction.display_name
    : uncertain
      ? "Chưa đủ chắc chắn"
      : "Chưa nhận diện được";
  const catalogAvailable =
    prediction && (prediction.plant_id || prediction.disease_id);

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: photo.uri }}
        style={styles.image}
        resizeMode="contain"
        accessibilityLabel="Ảnh cây đã phân tích"
        onError={onImageError}
      />
      <View style={styles.content}>
        <View style={[styles.badge, !identified && styles.uncertainBadge]}>
          <Ionicons
            name={identified ? "leaf-outline" : "help-circle-outline"}
            size={17}
            color={colors.primaryLight}
          />
          <Text style={styles.badgeText}>
            {identified ? "Gợi ý từ mô hình" : "Cần kiểm tra thêm"}
          </Text>
        </View>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        <Text style={styles.body}>{result.message}</Text>

        {prediction && (
          <>
            <Text style={styles.plantName}>Cây: {prediction.plant_name}</Text>
            <Text style={styles.body}>
              {prediction.is_healthy
                ? "Chưa phát hiện bệnh thuộc các nhãn hỗ trợ. Ảnh gần với nhóm lá khỏe; điều này không loại trừ mọi bệnh khác."
                : `Bệnh gợi ý: ${prediction.disease_name || prediction.display_name}`}
            </Text>
            <View style={styles.confidenceRow}>
              <Text style={styles.label}>Điểm mô hình</Text>
              <Text style={styles.confidence}>
                {scoreText(prediction.confidence)}
              </Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.progress,
                  { width: scoreText(prediction.confidence) },
                ]}
              />
            </View>
            <Text style={styles.note}>
              Điểm này chưa được hiệu chỉnh thành xác suất chẩn đoán đúng.
            </Text>
            {!!prediction.symptoms && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Triệu chứng trong danh mục
                </Text>
                <Text style={styles.body}>{prediction.symptoms}</Text>
              </View>
            )}
            {!!prediction.care_advice && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Thông tin chăm sóc trong danh mục
                </Text>
                <Text style={styles.body}>{prediction.care_advice}</Text>
              </View>
            )}
            {!catalogAvailable && (
              <Text style={styles.note}>
                Danh mục của ứng dụng chưa có dữ liệu tương ứng. Chưa có thông
                tin chăm sóc hoặc điều trị cho kết quả này.
              </Text>
            )}
            {!!catalogAvailable &&
              !prediction.symptoms &&
              !prediction.care_advice && (
                <Text style={styles.note}>
                  Danh mục hiện chưa bổ sung triệu chứng hoặc hướng dẫn chăm sóc
                  cho kết quả này.
                </Text>
              )}
          </>
        )}

        {uncertain && result.alternatives.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Một số khả năng để tham khảo
            </Text>
            <Text style={styles.note}>
              Chưa chọn được kết luận. Không dùng các gợi ý dưới đây để tự điều
              trị.
            </Text>
            {result.alternatives.slice(0, 3).map((candidate) => (
              <View key={candidate.class_id} style={styles.candidate}>
                <Text style={styles.candidateName}>
                  {candidate.display_name}
                </Text>
                <Text style={styles.label}>
                  {scoreText(candidate.confidence)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {!identified && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thử chụp lại</Text>
            {RETAKE_TIPS.map((tip) => (
              <View key={tip} style={styles.tip}>
                <Ionicons
                  name="camera-outline"
                  size={18}
                  color={colors.primaryLight}
                />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}
        <Text style={styles.notice}>
          Kết quả chỉ mang tính tham khảo. Mô hình chỉ hỗ trợ một số nhóm
          cây/bệnh và có thể nhận nhầm ảnh ngoài phạm vi, kể cả khi điểm cao.
          Nếu cây tiếp tục xấu đi, hãy nhờ người có chuyên môn kiểm tra.
        </Text>
        <View style={styles.actions}>
          <Button mode="outlined" onPress={onBack}>
            Xem lại ảnh
          </Button>
          <Button mode="contained" icon="camera-outline" onPress={onRetake}>
            Chụp / chọn ảnh mới
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, overflow: "hidden", backgroundColor: colors.white },
  image: { width: "100%", aspectRatio: 1.4, backgroundColor: "#10231D" },
  content: { padding: spacing.xl, gap: spacing.md },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    backgroundColor: colors.lightMint,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  uncertainBadge: { backgroundColor: colors.warmPeachBg },
  badgeText: {
    ...typography.caption,
    color: colors.primaryLight,
    fontWeight: "600",
  },
  title: { ...typography.title, color: colors.textPrimary },
  plantName: { ...typography.label, color: colors.textPrimary },
  confidenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  label: { ...typography.caption, color: colors.textSecondary },
  confidence: { ...typography.label, color: colors.primaryLight },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.lightMint,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.primaryLight,
  },
  section: { gap: spacing.sm, marginTop: spacing.sm },
  sectionTitle: { ...typography.label, color: colors.textPrimary },
  body: { ...typography.body, color: colors.textSecondary },
  note: { ...typography.caption, color: colors.textSecondary },
  candidate: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  candidateName: { ...typography.body, color: colors.textPrimary, flex: 1 },
  tip: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  tipText: { ...typography.body, flex: 1, color: colors.textSecondary },
  notice: {
    ...typography.caption,
    color: colors.textSecondary,
    padding: spacing.md,
    backgroundColor: colors.warmPeachBg,
    borderRadius: 12,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
