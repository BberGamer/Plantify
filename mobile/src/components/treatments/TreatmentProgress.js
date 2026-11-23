import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { colors, radius, spacing, typography } from "../../theme";

const STATUS = {
  generated: ["Chờ áp dụng", colors.textSecondary, colors.borderLight],
  in_progress: ["Đang điều trị", "#946017", colors.warmPeachBg],
  recovered: ["Đã hồi phục", colors.primaryLight, colors.lightMint],
  failed: ["Chưa hồi phục", colors.statusError, colors.errorBackground],
  cancelled: ["Đã hủy", colors.textSecondary, colors.borderLight],
};

export function TreatmentStatusBadge({ status }) {
  const [label, color, backgroundColor] = STATUS[status] || STATUS.generated;
  return <View style={[styles.badge, { backgroundColor }]}><Text style={[styles.badgeText, { color }]}>{label}</Text></View>;
}

export default function TreatmentProgress({ currentDay, duration, completedTasks, totalTasks }) {
  const progress = Math.max(0, Math.min(100, duration ? (currentDay / duration) * 100 : 0));
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.heading}>Tiến độ điều trị</Text>
        <Text style={styles.value}>{currentDay}/{duration} ngày</Text>
      </View>
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: duration, now: currentDay }}
      >
        <View style={[styles.fill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.caption}>{completedTasks}/{totalTasks} công việc đã hoàn thành</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.card, padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.md },
  heading: { ...typography.section, flex: 1, color: colors.textPrimary },
  value: { ...typography.label, color: colors.primaryLight },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.lightMint, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4, backgroundColor: colors.primaryLight },
  caption: { ...typography.caption, color: colors.textSecondary },
  badge: { alignSelf: "flex-start", borderRadius: radius.sm, paddingHorizontal: 9, paddingVertical: 5 },
  badgeText: { ...typography.caption, fontWeight: "700" },
});
