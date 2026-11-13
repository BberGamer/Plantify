import { Image, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { colors, spacing, typography } from "../../theme";

export default function DiagnosisPreview({
  photo,
  busy,
  analyzing,
  imageInvalid,
  onRetake,
  onPickPhoto,
  onImageError,
  onAnalyze,
}) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: photo.uri }}
        style={styles.image}
        resizeMode="contain"
        accessibilityLabel="Ảnh cây đã chọn"
        onError={onImageError}
      />
      <View style={styles.actions}>
        <Button mode="outlined" onPress={onRetake} disabled={busy}>
          Chụp lại
        </Button>
        <Button mode="outlined" onPress={onPickPhoto} disabled={busy}>
          Chọn ảnh khác
        </Button>
      </View>
      <Text style={styles.hint}>
        Chọn ảnh rõ nét của một cây hoặc một lá, đủ sáng và không dùng bộ lọc.
      </Text>
      <Button
        mode="contained"
        onPress={onAnalyze}
        loading={analyzing}
        disabled={busy || imageInvalid}
        style={styles.resultButton}
      >
        {analyzing ? "Đang phân tích ảnh…" : "Phân tích ảnh"}
      </Button>
      {analyzing && (
        <Text style={styles.progress} accessibilityLiveRegion="polite">
          Đang gửi ảnh và nhận diện. Vui lòng chờ.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, overflow: "hidden", backgroundColor: colors.white },
  image: { width: "100%", aspectRatio: 0.85, backgroundColor: "#10231D" },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  resultButton: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  progress: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
});
