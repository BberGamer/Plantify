import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import DetailField from "../common/DetailField";
import { colors, spacing, typography } from "../../theme";

const identityLabels = {
  common_name: "Tên cây",
  scientific_name: "Tên khoa học",
  botanical_family: "Họ thực vật",
  description: "Mô tả",
};
const careLabels = {
  light: "Ánh sáng",
  water: "Tưới nước",
  temperature: "Nhiệt độ",
  humidity: "Độ ẩm",
  soil: "Đất trồng",
  fertilizer: "Phân bón",
};

export default function PlantDetails({ plant }) {
  if (!plant) return null;
  return (
    <View style={styles.details}>
      <Text style={styles.heading} accessibilityRole="header">Thông tin cây</Text>
      {Object.entries(identityLabels).map(([key, label]) => (
        <DetailField key={key} label={label} value={plant[key]}
          emptyText="Chưa cập nhật" style={styles.field} />
      ))}
      <Text style={styles.heading} accessibilityRole="header">Chăm sóc cây</Text>
      {Object.entries(careLabels).map(([key, label]) => (
        <DetailField key={key} label={label} value={plant.care_requirements?.[key]}
          emptyText="Chưa cập nhật" style={styles.field} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  details: { gap: spacing.md },
  heading: { ...typography.section, color: colors.textPrimary },
  field: {
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
  },
});
