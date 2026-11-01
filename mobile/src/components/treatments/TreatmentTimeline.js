import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "../../theme";

export default function TreatmentTimeline({ stages, currentStageOrder }) {
  return <View>{stages.map((stage, index) => {
    const completed = stage.order < currentStageOrder;
    const current = stage.order === currentStageOrder;
    const label = completed ? "Đã hoàn thành" : current ? "Đang thực hiện" : "Sắp tới";
    const color = completed ? colors.statusSuccess : current ? colors.primaryLight : colors.textMuted;
    return <View key={stage._id} style={styles.item}>
      <View style={styles.rail}>
        <Ionicons name={completed ? "checkmark-circle" : current ? "radio-button-on" : "ellipse"} size={20} color={color} />
        {index < stages.length - 1 && <View style={styles.line} />}
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Ngày {stage.start_day}–{stage.end_day}: {stage.title}</Text>
        <Text style={[styles.status, { color }]}>{label}</Text>
      </View>
    </View>;
  })}</View>;
}

const styles = StyleSheet.create({
  item: { flexDirection: "row", minHeight: 72, gap: spacing.md },
  rail: { width: 22, alignItems: "center" },
  line: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  content: { flex: 1, paddingBottom: spacing.lg },
  title: { ...typography.label, color: colors.textPrimary },
  status: { ...typography.caption, fontWeight: "600", marginTop: spacing.xs },
});
