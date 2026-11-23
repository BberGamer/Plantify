import { Pressable, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function CareTaskCard({ task, today, busy, onComplete, onStop }) {
  const watering = task.action_type === "watering";
  const completed = task.status === "completed";
  const paused = task.status === "paused";
  const overdue = !completed && !paused && task.date < today;
  const tone = completed ? "#247855" : paused ? "#8A6C36" : overdue ? "#B75B3A" : "#52776A";
  const status = completed ? "Đã hoàn thành" : paused ? "Tạm dừng" : overdue ? "Quá hạn" : "Chờ chăm sóc";
  return <View style={[s.card, completed && s.completed]}>
    <View style={s.top}>
      <View style={[s.icon, { backgroundColor: watering ? "#EDF5FC" : "#F4F0FB" }]}>
        <Ionicons name={watering ? "water-outline" : "leaf-outline"} size={25} color={watering ? "#5C94C2" : "#9476B5"} />
      </View>
      <View style={s.heading}>
        <Text style={s.plant}>{task.plant_name}</Text>
        <Text style={[s.title, completed && s.doneTitle]}>{task.title}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Dừng lịch ${task.title} cho ${task.plant_name}`} disabled={busy} onPress={onStop} hitSlop={8} style={s.menu}>
        <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
      </Pressable>
    </View>
    <View style={s.meta}>
      <Ionicons name="time-outline" size={14} color="#85968E" /><Text style={s.metaText}>{task.time}</Text>
      <View style={s.dot} />
      <Ionicons name="repeat-outline" size={14} color="#85968E" /><Text style={s.metaText}>{task.repeat_every_days === 1 ? "Hằng ngày" : `Mỗi ${task.repeat_every_days} ngày`}</Text>
    </View>
    {!!task.notes && <Text style={s.notes}>{task.notes}</Text>}
    <View style={s.footer}>
      <View style={[s.badge, { backgroundColor: completed ? "#EDF7F1" : paused ? "#FBF5E9" : overdue ? "#FFF1EA" : "#F0F5F2" }]}>
        <Ionicons name={completed ? "checkmark-circle" : paused ? "pause-circle-outline" : overdue ? "alert-circle-outline" : "ellipse-outline"} size={14} color={tone} />
        <Text style={[s.badgeText, { color: tone }]}>{status}</Text>
      </View>
      {!completed && !paused && <Button mode="text" compact icon="check" textColor={colors.primaryLight} disabled={busy || task.date > today} onPress={onComplete} labelStyle={s.completeLabel}>{task.date > today ? "Chưa đến ngày" : "Hoàn thành"}</Button>}
      {completed && <Ionicons name="checkmark-done-outline" size={23} color="#68A787" />}
      {paused && <Text style={s.pauseNote}>Cây đang điều trị</Text>}
    </View>
  </View>;
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: "#E8EEE9", gap: 14 },
  completed: { borderColor: "#E1EDE4", backgroundColor: "#FDFEFD" },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { width: 50, height: 54, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  heading: { flex: 1, minWidth: 0, gap: 4 }, plant: { fontSize: 12, color: "#7B8C82", fontWeight: "500" },
  title: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, lineHeight: 23 },
  doneTitle: { color: "#718A7A" }, menu: { minWidth: 32, minHeight: 44, alignItems: "center", justifyContent: "center" },
  meta: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  metaText: { fontSize: 12, color: "#7B8C82" }, dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "#CAD7CE", marginHorizontal: 3 },
  notes: { fontSize: 13, lineHeight: 20, color: "#718078", backgroundColor: "#F7FAF7", padding: 11, borderRadius: 10 },
  footer: { borderTopWidth: 1, borderTopColor: "#F0F3EF", paddingTop: 11, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6, flexWrap: "wrap" },
  badge: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 6, paddingHorizontal: 9, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "600" }, completeLabel: { fontSize: 12, fontWeight: "700" }, pauseNote: { color: "#9A8A6D", fontSize: 11 },
});
