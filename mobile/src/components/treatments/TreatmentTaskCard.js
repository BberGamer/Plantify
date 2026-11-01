import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../../theme";

const META = {
  completed: ["checkmark-circle", colors.statusSuccess, "Đã hoàn thành"],
  pending: ["ellipse-outline", colors.primaryLight, "Cần thực hiện"],
  upcoming: ["time-outline", colors.textMuted, "Sắp tới"],
};

export default function TreatmentTaskCard({ task, busy, onComplete }) {
  const [icon, color, label] = META[task.status] || META.upcoming;
  const canComplete = task.status === "pending";
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons name={icon} size={22} color={color} />
        <View style={styles.content}>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={[styles.status, { color }]}>{label} · {new Intl.DateTimeFormat("vi-VN").format(new Date(task.scheduled_date))}</Text>
          {!!task.instructions && <Text style={styles.body}>{task.instructions}</Text>}
        </View>
      </View>
      {canComplete && <Button mode="outlined" onPress={() => onComplete(task)} loading={busy} disabled={busy}>
        Đánh dấu đã hoàn thành
      </Button>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  content: { flex: 1, minWidth: 0, gap: spacing.xs },
  title: { ...typography.label, color: colors.textPrimary },
  status: { ...typography.caption, fontWeight: "600" },
  body: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
});
