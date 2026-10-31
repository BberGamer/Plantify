import { Image, StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";
import { colors, spacing } from "../../theme";

export default function DiagnosisPreview({ photo, busy, onRetake, onPickPhoto, onImageError }) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: photo.uri }} style={styles.image} resizeMode="contain"
        accessibilityLabel="Ảnh cây đã chọn" onError={onImageError}
      />
      <View style={styles.actions}>
        <Button mode="outlined" onPress={onRetake} disabled={busy}>Chụp lại</Button>
        <Button mode="contained" onPress={onPickPhoto} loading={busy} disabled={busy}>
          Chọn ảnh khác
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, overflow: "hidden", backgroundColor: colors.white },
  image: { width: "100%", aspectRatio: 0.85, backgroundColor: "#10231D" },
  actions: {
    flexDirection: "row", flexWrap: "wrap", justifyContent: "center",
    gap: spacing.md, padding: spacing.lg,
  },
});
