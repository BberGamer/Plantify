import { componentStyles } from "../../theme/componentStyles";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../../theme";

const META = {
  completed: ["checkmark-circle", colors.statusSuccess, "Đã hoàn thành"],
  pending: ["ellipse-outline", colors.primaryLight, "Cần thực hiện"],
  upcoming: ["time-outline", colors.textMuted, "Sắp tới"],
};

export default function TreatmentTaskCard({
  task,
  busy,
  editable,
  onComplete,
  onEdit,
}) {
  const [icon, color, label] = META[task.status] || META.upcoming;
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons name={icon} size={22} color={color} />
        <View style={styles.content}>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={[styles.status, { color }]}>
            {label} ·{" "}
            {new Intl.DateTimeFormat("vi-VN").format(
              new Date(task.scheduled_date),
            )}{" "}
            · {task.time || "08:00"}
          </Text>
          {!!task.instructions && (
            <Text style={styles.body}>{task.instructions}</Text>
          )}
          {!!task.dosage_note && (
            <Text style={styles.dosage}>Liều lượng: {task.dosage_note}</Text>
          )}
          {!!task.important_note && (
            <Text style={styles.important}>Lưu ý: {task.important_note}</Text>
          )}
        </View>
      </View>
      {editable && (
        <View style={styles.actions}>
          <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
            mode="outlined"
            icon="pencil-outline"
            onPress={() => onEdit(task)}
            disabled={busy}
          >
            Chỉnh sửa
          </Button>
          {task.status === "pending" && (
            <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
              mode="outlined"
              onPress={() => onComplete(task)}
              loading={busy}
              disabled={busy}
            >
              Đánh dấu đã hoàn thành
            </Button>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs
  },
  title: {
    ...typography.label,
    color: colors.textPrimary
  },
  status: {
    ...typography.caption,
    fontWeight: "600"
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs
  },
  dosage: {
    ...typography.label,
    color: colors.primaryLight,
    marginTop: spacing.xs
  },
  important: {
    ...typography.body,
    color: colors.statusError,
    marginTop: spacing.xs
  },
  actions: {
    gap: spacing.sm
  }
});
