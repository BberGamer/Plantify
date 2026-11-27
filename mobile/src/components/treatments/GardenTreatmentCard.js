import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Checkbox, Text } from "react-native-paper";
import { useActiveTreatment } from "../../hooks/useTreatment";
import { colors, radius, spacing, typography } from "../../theme";
import { componentStyles } from "../../theme/componentStyles";
import { gardenToday } from "../../utils/gardenDate";
import treatmentLogic from "../../utils/treatmentLogic.cjs";
import NoticeBanner from "../common/NoticeBanner";
import SectionCard from "../common/SectionCard";

const timeFormat = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const taskLabels = {
  upcoming: "Chưa đến giờ",
  completed: "Đã hoàn thành",
  skipped: "Đã bỏ qua",
};

export default function GardenTreatmentCard({ summary, onOpenProgress }) {
  const treatment = useActiveTreatment(summary._id);
  const { data, progress, refresh } = treatment;
  const todayStart = Date.parse(`${gardenToday()}T00:00:00+07:00`);
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;
  const todayTasks = (data?.task_progress ?? []).filter((task) => {
    const scheduled = Date.parse(task.scheduled_date);
    return scheduled >= todayStart && scheduled < todayEnd;
  }).sort((left, right) => Date.parse(left.scheduled_date) - Date.parse(right.scheduled_date));

  const now = Date.now();
  const nextRefresh = todayTasks.reduce((next, task) => {
    const scheduled = Date.parse(task.scheduled_date);
    return task.status === "upcoming" && scheduled > now ? Math.min(next, scheduled) : next;
  }, todayEnd);
  const isActive = data?.status === "in_progress";
  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(refresh, Math.max(0, nextRefresh - Date.now()));
    return () => clearTimeout(timer);
  }, [isActive, nextRefresh, refresh]);

  return (
    <SectionCard title={!data || isActive ? "Đang điều trị" : "Lịch điều trị"} icon="medkit-outline">
      <Text style={styles.body}>
        Ngày {data ? progress.currentDay : summary.current_day}/{data ? progress.duration : summary.duration_days}
      </Text>
      <Text style={styles.body} accessibilityLiveRegion="polite">
        {data ? progress.completedTasks : summary.completed_tasks}/{data ? progress.totalTasks : summary.total_tasks} công việc đã hoàn thành
      </Text>
      <View style={styles.tasks}>
        <Text style={styles.heading} accessibilityRole="header">Công việc hôm nay</Text>
        {!!treatment.error && (
          <NoticeBanner tone="error" message={treatment.error}>
            <Button onPress={data ? refresh : () => treatment.retry()}>Thử lại</Button>
          </NoticeBanner>
        )}
        {!!treatment.mutationError && <NoticeBanner tone="error" message={treatment.mutationError} />}
        {treatment.loading && !data && (
          <Text style={styles.body} accessibilityLiveRegion="polite">Đang tải công việc điều trị…</Text>
        )}
        {!!data && !todayTasks.length && (
          <Text style={styles.body}>Hôm nay không có công việc điều trị.</Text>
        )}
        {todayTasks.map((task) => {
          const checked = task.status === "completed";
          const busy = treatment.completingTaskId === task._id;
          const status = busy ? "Đang lưu" : taskLabels[task.status];
          return (
            <View key={task._id} style={styles.task}>
              <View style={styles.taskContent}>
                <Text style={styles.heading}>{task.title}</Text>
                <Text style={styles.meta} accessibilityLiveRegion="polite">
                  {timeFormat.format(new Date(task.scheduled_date))}{status ? ` · ${status}` : ""}
                </Text>
                {!!task.instructions && <Text style={styles.body}>{task.instructions}</Text>}
                {!!task.dosage_note && <Text style={styles.body}>Liều lượng · {task.dosage_note}</Text>}
                {!!task.important_note && <Text style={styles.body}>{`Lưu ý: ${task.important_note}`}</Text>}
              </View>
              <Checkbox.Android
                status={checked ? "checked" : "unchecked"}
                disabled={!isActive || !treatmentLogic.canCompleteTask(task) || Boolean(treatment.completingTaskId)}
                accessibilityLabel={`${checked ? "Đã hoàn thành" : "Đánh dấu hoàn thành"} ${task.title}`}
                hitSlop={6}
                color={colors.primary}
                onPress={() => treatment.completeTask(task._id)}
              />
            </View>
          );
        })}
      </View>
      <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} mode="contained" onPress={onOpenProgress}>
        Xem tiến độ điều trị
      </Button>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  tasks: { gap: spacing.sm },
  task: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.softMintBg,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  taskContent: { flex: 1, minWidth: 0, gap: spacing.xs },
  heading: { ...typography.label, color: colors.textPrimary },
  body: { ...typography.body, color: colors.textSecondary },
  meta: { ...typography.caption, color: colors.textSecondary },
});
