import { componentStyles } from "../../theme/componentStyles";
import { radius } from "../../theme";
import { Pressable, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import CareTaskInstructions from "./CareTaskInstructions";

const actionIcons = {
  watering: { name: "water-outline", color: "#5C94C2", backgroundColor: "#EDF5FC" },
  fertilizing: { name: "leaf-outline", color: "#9476B5", backgroundColor: "#F4F0FB" },
  sunlight: { name: "sunny-outline", color: "#9B782E", backgroundColor: "#FFF4D9" },
  inspection: { name: "eye-outline", color: "#497466", backgroundColor: "#ECF6EF" },
};

export default function CareTaskCard({
  task,
  today,
  busy,
  onComplete,
  onStop,
  showPlantName = true,
}) {
  const icon = actionIcons[task.action_type] ?? actionIcons.fertilizing;
  const completed = task.status === "completed";
  const paused = task.status === "paused";
  const overdue = !completed && !paused && task.date < today;
  const tone = completed
    ? colors.primaryLight
    : paused
      ? "#8A6C36"
      : overdue
        ? colors.statusError
        : "#52776A";
  const status = completed
    ? "Đã hoàn thành"
    : paused
      ? "Tạm dừng"
      : overdue
        ? "Quá hạn"
        : "Chờ chăm sóc";
  return (
    <View style={[s.card, completed && s.completed]}>
      <View style={s.top}>
        <View
          style={[
            s.icon,
            { backgroundColor: icon.backgroundColor },
          ]}
        >
          <Ionicons
            name={icon.name}
            size={25}
            color={icon.color}
          />
        </View>
        <View style={s.heading}>
          {showPlantName && <Text style={s.plant}>{task.plant_name}</Text>}
          <Text style={[s.title, completed && s.doneTitle]}>{task.title}</Text>
        </View>
        {onStop && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Dừng lịch ${task.title} cho ${task.plant_name}`}
            disabled={busy}
            onPress={onStop}
            hitSlop={8}
            style={s.menu}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
      <View style={s.meta}>
        <Ionicons name="time-outline" size={14} color="#85968E" />
        <Text style={s.metaText}>{task.time}</Text>
        <View style={s.dot} />
        <Ionicons name="repeat-outline" size={14} color="#85968E" />
        <Text style={s.metaText}>
          {task.repeat_every_days === 1
            ? "Hằng ngày"
            : `Mỗi ${task.repeat_every_days} ngày`}
        </Text>
      </View>
      <CareTaskInstructions task={task} />
      <View style={s.footer}>
        <View
          style={[
            s.badge,
            {
              backgroundColor: completed
                ? colors.lightMint
                : paused
                  ? "#FBF5E9"
                  : overdue
                    ? "#FFF1EA"
                    : "#F0F5F2",
            },
          ]}
        >
          <Ionicons
            name={
              completed
                ? "checkmark-circle"
                : paused
                  ? "pause-circle-outline"
                  : overdue
                    ? "alert-circle-outline"
                    : "ellipse-outline"
            }
            size={14}
            color={tone}
          />
          <Text style={[s.badgeText, { color: tone }]}>{status}</Text>
        </View>
        {!completed && !paused && (
          <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
            mode="text"
            compact
            icon="check"
            textColor={colors.primaryLight}
            disabled={busy || task.date > today}
            onPress={onComplete}
            labelStyle={s.completeLabel}
          >
            {task.date > today ? "Chưa đến ngày" : "Hoàn thành"}
          </Button>
        )}
        {completed && (
          <Ionicons name="checkmark-done-outline" size={23} color="#68A787" />
        )}
        {paused && <Text style={s.pauseNote}>Cây đang điều trị</Text>}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8EEE9",
    gap: 14
  },
  completed: {
    borderColor: "#E1EDE4",
    backgroundColor: "#FDFEFD"
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  icon: {
    width: 50,
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center"
  },
  heading: {
    flex: 1,
    minWidth: 0,
    gap: 4
  },
  plant: {
    fontSize: 13,
    lineHeight: 20,
    color: "#7B8C82",
    fontWeight: "500"
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    lineHeight: 23
  },
  doneTitle: {
    color: "#718A7A"
  },
  menu: {
    minWidth: 32,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap"
  },
  metaText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#7B8C82"
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#CAD7CE",
    marginHorizontal: 3
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#F0F3EF",
    paddingTop: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    flexWrap: "wrap"
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 8
  },
  badgeText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600"
  },
  completeLabel: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700"
  },
  pauseNote: {
    color: "#9A8A6D",
    fontSize: 13,
    lineHeight: 20
  }
});
