import { StyleSheet, View } from "react-native";
import { Button, IconButton, Text } from "react-native-paper";
import ImageWithFallback from "../common/ImageWithFallback";
import { colors, radius, spacing } from "../../theme";
import { componentStyles } from "../../theme/componentStyles";

export default function CatalogImageFields({ images, disabled, onChange, onChoosePhoto }) {
  return (
    <View style={styles.section}>
      <Text variant="titleMedium">Hình ảnh</Text>
      <Text>JPG hoặc PNG, tối đa 10 MB mỗi ảnh và 6 ảnh mới mỗi lần lưu.</Text>
      {images.map((row, index) => (
        <View key={`${row.photo?.uri || row.image_url}-${index}`} style={styles.row}>
          <ImageWithFallback
            uri={row.photo?.uri || row.image_url}
            style={styles.image}
            accessibilityLabel={index === 0 ? "Ảnh bìa" : `Ảnh ${index + 1}`}
          />
          {index === 0 ? <Text style={styles.cover}>Ảnh bìa</Text> : (
            <Button
              style={componentStyles.buttonShape}
              contentStyle={componentStyles.button}
              disabled={disabled}
              onPress={() => onChange([row, ...images.filter((_, position) => position !== index)])}
            >
              Đặt làm ảnh bìa
            </Button>
          )}
          <IconButton
            icon="trash-can-outline"
            iconColor={colors.statusError}
            accessibilityLabel={`Xóa ảnh ${index + 1}`}
            disabled={disabled}
            onPress={() => onChange(images.filter((_, position) => position !== index))}
          />
        </View>
      ))}
      <Button
        mode="outlined"
        icon="image-plus"
        style={componentStyles.buttonShape}
        contentStyle={componentStyles.button}
        disabled={disabled}
        onPress={onChoosePhoto}
      >
        Thêm ảnh
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md, marginBottom: spacing.lg },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  image: { width: 66, height: 66, borderRadius: radius.md },
  cover: { paddingHorizontal: spacing.sm },
});
