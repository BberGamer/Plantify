import { Image, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing, typography } from "../../theme";
import { TreatmentStatusBadge } from "./TreatmentProgress";

export default function TreatmentSummary({
  plant,
  disease,
  status,
  style,
  imageStyle,
  children,
}) {
  return (
    <View style={[styles.summary, style]}>
      <Image
        source={{ uri: plant.image_url }}
        style={[styles.image, imageStyle]}
        accessibilityLabel={`Ảnh cây ${plant.plant_nickname}`}
      />
      <View style={styles.content}>
        <TreatmentStatusBadge status={status} />
        <Text style={styles.plant}>{plant.plant_nickname}</Text>
        <Text style={styles.disease}>{disease.disease_name}</Text>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: "row", gap: spacing.lg },
  image: { backgroundColor: colors.lightMint },
  content: { flex: 1, minWidth: 0, justifyContent: "center", gap: spacing.xs },
  plant: { ...typography.section, color: colors.textPrimary },
  disease: { ...typography.body, color: colors.textSecondary },
});
