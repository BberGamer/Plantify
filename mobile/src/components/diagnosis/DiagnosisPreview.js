import { componentStyles } from "../../theme/componentStyles";
import { radius } from "../../theme";
import { Image, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { colors, spacing, typography } from "../../theme";

// Mục đích: Cho xem ảnh trước khi phân tích.
// Cách chạy: Render ảnh và nút phân tích/chọn lại; khóa nút và hiển thị tiến trình khi bận.
export default function DiagnosisPreview({
  photo,
  busy,
  analyzing,
  imageInvalid,
  onRetake,
  onPickPhoto,
  onImageError,
  onAnalyze,
  identification = false,
}) {
  const imageRatio =
    photo.width > 0 && photo.height > 0
      ? Math.max(0.65, Math.min(1.8, photo.width / photo.height))
      : 1;
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: photo.uri }}
        style={[styles.image, { aspectRatio: imageRatio }]}
        resizeMode="contain"
        accessibilityLabel="Ảnh cây đã chọn"
        onError={onImageError}
      />
      <View style={styles.actions}>
        <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} mode="outlined" onPress={onRetake} disabled={busy}>
          Chụp lại
        </Button>
        <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} mode="outlined" onPress={onPickPhoto} disabled={busy}>
          Chọn ảnh khác
        </Button>
      </View>
      <Text style={styles.hint}>
        Chọn ảnh rõ nét của một cây hoặc một lá, đủ sáng và không dùng bộ lọc.
      </Text>
      <Button contentStyle={componentStyles.button}
        mode="contained"
        onPress={onAnalyze}
        loading={analyzing}
        disabled={busy || imageInvalid}
        style={[styles.resultButton, componentStyles.buttonShape]}
      >
        {analyzing
          ? "Đang phân tích ảnh…"
          : identification
            ? "Nhận diện cây"
            : "Chẩn đoán bệnh"}
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
  card: {
    borderRadius: radius.card,
    overflow: "hidden",
    backgroundColor: colors.white
  },
  image: {
    width: "100%",
    backgroundColor: "#10231D"
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.lg
  },
  resultButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg
  },
  progress: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg
  }
});
