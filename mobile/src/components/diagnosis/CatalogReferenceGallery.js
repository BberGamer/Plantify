import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import ImageWithFallback from "../common/ImageWithFallback";
import { colors, radius, spacing, typography } from "../../theme";

export default function CatalogReferenceGallery({ images, name }) {
  const items = Array.isArray(images)
    ? images.filter((url) => typeof url === "string" && url.trim())
    : [];
  if (!items.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Ảnh tham khảo</Text>
      <View style={styles.gallery}>
        {items.map((url, index) => (
          <View key={url} style={styles.card}>
            <ImageWithFallback
              uri={url}
              style={styles.image}
              accessibilityLabel={`Ảnh tham khảo ${index + 1} của ${name}`}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  title: { ...typography.section, color: colors.textPrimary },
  gallery: { flexDirection: "row", gap: spacing.sm },
  card: {
    flex: 1,
    minWidth: 0,
    maxWidth: "33%",
    overflow: "hidden",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  image: { width: "100%", aspectRatio: 1, backgroundColor: colors.lightMint },
});
