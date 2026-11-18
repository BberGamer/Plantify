import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing, typography } from "../../theme";

const labels = {
  disease_name: "Tên bệnh",
  scientific_name: "Tên khoa học",
  pathogen_type: "Tác nhân gây bệnh",
  typical_symptoms: "Triệu chứng điển hình",
  environmental_cause: "Nguyên nhân môi trường",
};
const pathogens = { fungus: "Nấm", bacteria: "Vi khuẩn", virus: "Virus", pest: "Sâu hại",
  nematode: "Tuyến trùng", physiological: "Sinh lý", other: "Khác" };

export default function DiseaseDetails({ disease }) {
  if (!disease) return null;
  const fields = Object.keys(labels);
  return <View style={styles.details}>
    <Text style={styles.heading} accessibilityRole="header">Thông tin bệnh</Text>
    {fields.map((key) => {
      let value = disease[key];
      if (key === "pathogen_type") value = pathogens[value] || value;
      return <View key={key} style={styles.field}>
        <Text style={styles.label}>{labels[key]}</Text>
        <Text selectable style={value ? styles.value : styles.empty}>
          {value || "Chưa cập nhật"}
        </Text>
      </View>;
    })}
  </View>;
}

const styles = StyleSheet.create({
  details: { gap: spacing.md },
  heading: { ...typography.section, color: colors.textPrimary },
  field: { gap: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.md },
  label: { ...typography.body, fontWeight: "600", color: colors.textPrimary },
  value: { ...typography.body, color: colors.textSecondary },
  empty: { ...typography.body, color: colors.textSecondary, fontStyle: "italic" },
});
