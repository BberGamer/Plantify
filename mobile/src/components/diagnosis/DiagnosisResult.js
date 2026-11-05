import { Image, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "../../theme";

const SAMPLE_RESULT = {
  disease: "Bệnh đốm lá",
  confidence: 92,
  symptoms: "Các đốm nâu nhỏ xuất hiện trên bề mặt lá, một số vùng quanh đốm chuyển vàng.",
  suggestions: [
    "Kiểm tra các lá còn lại trên cây.",
    "Theo dõi sự thay đổi của vùng lá có đốm.",
  ],
};

export default function DiagnosisResult({ photo, onBack, onRetake, onImageError }) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: photo.uri }} style={styles.image} resizeMode="contain"
        accessibilityLabel="Ảnh cây đã chọn" onError={onImageError}
      />
      <View style={styles.content}>
        <View style={styles.badge}>
          <Ionicons name="flask-outline" size={15} color={colors.primaryLight} />
          <Text style={styles.badgeText}>Kết quả mẫu</Text>
        </View>
        <Text style={styles.title}>{SAMPLE_RESULT.disease}</Text>
        <View style={styles.confidenceRow}>
          <Text style={styles.label}>Độ tin cậy</Text>
          <Text style={styles.confidence}>{SAMPLE_RESULT.confidence}%</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.progress, { width: `${SAMPLE_RESULT.confidence}%` }]} />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dấu hiệu thường gặp</Text>
          <Text style={styles.body}>{SAMPLE_RESULT.symptoms}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gợi ý chăm sóc</Text>
          {SAMPLE_RESULT.suggestions.map((suggestion) => (
            <View key={suggestion} style={styles.suggestion}>
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.primaryLight} />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </View>
          ))}
        </View>
        <View style={styles.actions}>
          <Button mode="outlined" onPress={onBack}>Xem lại ảnh</Button>
          <Button mode="contained" icon="camera-outline" onPress={onRetake}>Chụp ảnh mới</Button>
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
    flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: spacing.xs,
    backgroundColor: colors.lightMint, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6,
  },
  badgeText: { ...typography.caption, color: colors.primaryLight, fontWeight: "600" },
  title: { ...typography.title, color: colors.textPrimary },
  confidenceRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  label: { ...typography.caption, color: colors.textSecondary },
  confidence: { ...typography.label, color: colors.primaryLight },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.lightMint, overflow: "hidden" },
  progress: { height: "100%", borderRadius: 3, backgroundColor: colors.primaryLight },
  section: { gap: spacing.sm, marginTop: spacing.sm },
  sectionTitle: { ...typography.label, color: colors.textPrimary },
  body: { ...typography.body, color: colors.textSecondary },
  suggestion: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  suggestionText: { ...typography.body, flex: 1, color: colors.textSecondary },
  actions: {
    flexDirection: "row", flexWrap: "wrap", justifyContent: "center",
    gap: spacing.md, marginTop: spacing.lg,
  },
});
