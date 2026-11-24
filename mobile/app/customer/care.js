import BottomActionBar from "../../src/components/common/BottomActionBar";
import { FilterChip, FilterRow } from "../../src/components/common/FilterControls";
import { componentStyles } from "../../src/theme/componentStyles";
import { radius } from "../../src/theme";
﻿import { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Dialog, Portal, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import useCareTasks from "../../src/hooks/useCareTasks";
import { gardenToday, shiftDay } from "../../src/utils/gardenDate";
import useScreenScope from "../../src/hooks/useScreenScope";
import useCarePlants from "../../src/hooks/useCarePlants";
import CareTaskCard from "../../src/components/care/CareTaskCard";
import CareScheduleForm from "../../src/components/care/CareScheduleForm";
import { colors } from "../../src/theme/colors";

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const FULL_DAYS = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
const dateLabel = value => {
  const date = new Date(`${value}T00:00:00Z`);
  return `${FULL_DAYS[date.getUTCDay()]}, ${date.getUTCDate()} tháng ${date.getUTCMonth() + 1}`;
};
const monthLabel = value => `Tháng ${Number(value.slice(5, 7))}, ${value.slice(0, 4)}`;
const startOfWeek = day => shiftDay(day, -((new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7));
const FILTERS = [{ id: "all", label: "Tất cả", icon: "grid-outline" }, { id: "watering", label: "Tưới nước", icon: "water-outline" }, { id: "fertilizing", label: "Bón phân", icon: "leaf-outline" }];

function IconControl({ icon, label, onPress, disabled, style }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.iconControl, style, pressed && s.pressed, disabled && s.disabled]}><Ionicons name={icon} size={21} color={colors.textPrimary} /></Pressable>;
}

export default function CareScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const plantId = typeof params.plantId === "string" ? params.plantId : undefined;
  const requestedDate = typeof params.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
    && Number.isFinite(Date.parse(params.date))
    && new Date(params.date).toISOString().slice(0, 10) === params.date ? params.date : undefined;
  const today = gardenToday();
  const [day, setDay] = useState(requestedDate ?? today);
  const [week, setWeek] = useState(false);
  const [filter, setFilter] = useState("all");
  useEffect(() => {
    if (requestedDate) {
      setDay(requestedDate);
      setWeek(false);
      setFilter("all");
    }
  }, [requestedDate, plantId]);
  const firstDay = startOfWeek(day);
  const days = Array.from({ length: 7 }, (_, i) => shiftDay(firstDay, i));
  const care = useCareTasks(week ? firstDay : day, week ? shiftDay(firstDay, 6) : day, plantId);
  const { plants, plantLoading, plantError, loadPlants } = useCarePlants();
  const [formOpen, setFormOpen] = useState(params.create === "1");
  const [deleting, setDeleting] = useState(null);
  const scope = useScreenScope();
  async function save(body) {
    const current = scope.capture();
    const ok = await care.create(body);
    if (ok && current()) { setFormOpen(false); setDay(body.start_date); setFilter("all"); }
    return ok && current();
  }
  const visibleTasks = care.tasks.filter(t => filter === "all" || t.action_type === filter);
  const taskDates = [...new Set(visibleTasks.map(t => t.date))];
  const plantName = plants.find(p => p._id === plantId)?.plant_nickname;
  const hasData = !care.loading && !care.error;
  return <SafeAreaView style={s.screen} edges={["top", "left", "right", "bottom"]}>
    <View style={s.header}>
      <IconControl icon="arrow-back" label="Quay lại" onPress={() => router.back()} />
      <View style={s.headerCopy}><Text style={s.headerTitle}>Lịch chăm sóc</Text><Text style={s.headerSubtitle}>{plantName || "Chút quan tâm, thêm xanh mỗi ngày"}</Text></View>
    </View>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={care.loading} onRefresh={care.reload} colors={[colors.primary]} tintColor={colors.primary} />}>
      <View style={s.calendar}>
        <View style={s.monthRow}><View style={s.monthTitleRow}><Ionicons name="calendar-clear-outline" size={18} color={colors.primaryLight} /><Text style={s.monthTitle}>{monthLabel(day)}</Text></View><Pressable accessibilityRole="button" disabled={care.busy} onPress={() => setDay(today)} style={s.todayButton}><Text style={s.todayText}>Hôm nay</Text></Pressable></View>
        <View style={s.weekNavigation}><IconControl icon="chevron-back" label="Tuần trước" disabled={care.busy} onPress={() => setDay(shiftDay(day, -7))} style={s.weekArrow} /><Text style={s.rangeLabel}>{Number(firstDay.slice(8))}/{Number(firstDay.slice(5, 7))} – {Number(days[6].slice(8))}/{Number(days[6].slice(5, 7))}</Text><IconControl icon="chevron-forward" label="Tuần sau" disabled={care.busy} onPress={() => setDay(shiftDay(day, 7))} style={s.weekArrow} /></View>
        <View style={s.dayStrip}>{days.map(value => {
          const selected = value === day;
          const isToday = value === today;
          return <Pressable key={value} accessibilityRole="button" accessibilityLabel={`${dateLabel(value)}${isToday ? ", hôm nay" : ""}`} accessibilityState={{ selected, disabled: care.busy }} disabled={care.busy} onPress={() => setDay(value)} style={({ pressed }) => [s.day, selected && s.daySelected, pressed && s.pressed]}><Text style={[s.dayName, selected && s.daySelectedText]}>{WEEKDAYS[new Date(`${value}T00:00:00Z`).getUTCDay()]}</Text><Text style={[s.dayNumber, selected && s.daySelectedText]}>{Number(value.slice(8))}</Text><View style={[s.dayDot, isToday && { backgroundColor: selected ? "#D4E5B9" : colors.primaryLight }]} /></Pressable>;
        })}</View>
        <View style={s.segment}>{[{ active: !week, label: "Theo ngày", icon: "today-outline", value: false }, { active: week, label: "Cả tuần", icon: "calendar-outline", value: true }].map(item => <Pressable key={item.label} disabled={care.busy} accessibilityRole="button" accessibilityState={{ selected: item.active, disabled: care.busy }} onPress={() => setWeek(item.value)} style={[s.segmentItem, item.active && s.segmentActive]}><Ionicons name={item.icon} size={15} color={item.active ? colors.primary : colors.textMuted} /><Text style={[s.segmentText, item.active && s.segmentActiveText]}>{item.label}</Text></Pressable>)}</View>
      </View>

      <View style={s.sectionHeading}><View style={s.sectionCopy}><Text style={s.sectionTitle}>{week ? "Chăm sóc trong tuần" : day === today ? "Việc hôm nay" : "Việc trong ngày"}</Text><Text style={s.sectionSubtitle}>{week ? "Một nhịp đều đặn cho vườn luôn xanh" : dateLabel(day)}</Text></View>{hasData && <View style={s.taskCount}><Text style={s.taskCountText}>{visibleTasks.length}</Text></View>}</View>
      <FilterRow>{FILTERS.map(item => <FilterChip key={item.id} selected={filter === item.id}
        icon={item.icon} onPress={() => setFilter(item.id)}>{item.label}</FilterChip>)}</FilterRow>
      {!!care.error && <View style={s.errorCard}><Ionicons name="alert-circle-outline" size={22} color={colors.statusError} /><View style={s.flex}><Text style={s.errorText}>{care.error}</Text><Button contentStyle={componentStyles.button} compact onPress={care.reload} style={[s.retry, componentStyles.buttonShape]}>Thử lại</Button></View></View>}
      {care.loading && <View style={s.loading}><ActivityIndicator color={colors.primaryLight} /><Text style={s.loadingText}>Đang mở lịch khu vườn…</Text></View>}
      {!care.loading && taskDates.map(value => <View key={value} style={s.taskGroup}>
        {week && <View style={s.groupHeading}><View style={s.groupLine} /><Text style={s.groupTitle}>{value === today ? "Hôm nay · " : ""}{dateLabel(value)}</Text><View style={s.groupLine} /></View>}
        {visibleTasks.filter(task => task.date === value).map(task => <CareTaskCard key={`${task.schedule_id}:${task.date}`} task={task} today={today} busy={care.busy} onComplete={() => care.complete(task)} onStop={() => setDeleting(task)} />)}
      </View>)}
      {hasData && !visibleTasks.length && <View style={s.empty}><View style={s.emptyOrbit}><View style={s.emptyIcon}><Ionicons name={filter === "watering" ? "water-outline" : "leaf-outline"} size={36} color={colors.primaryLight} /></View><View style={s.emptySpark}><Ionicons name="sparkles" size={14} color="#A3B984" /></View></View><Text style={s.emptyTitle}>{filter !== "all" ? `Chưa có lịch ${filter === "watering" ? "tưới nước" : "bón phân"}` : "Một khoảng thảnh thơi"}</Text><Text style={s.emptyText}>Chưa có công việc {week ? "trong tuần này" : "trong ngày này"}.{"\n"}Tạo một lịch nhỏ để luôn nhớ chăm cây nhé.</Text><Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} mode="text" icon="plus" onPress={() => setFormOpen(true)} disabled={care.busy}>Lên lịch cho cây</Button></View>}
      <View style={s.tip}><View style={s.tipIcon}><Ionicons name="sunny-outline" size={20} color="#9B9560" /></View><View style={s.flex}><Text style={s.tipTitle}>Chăm đúng nhịp, cây thêm khỏe</Text><Text style={s.tipText}>Quan sát độ ẩm đất trước khi tưới. Lịch thường sẽ tự tạm dừng khi cây đang điều trị.</Text></View></View>
    </ScrollView>
    <BottomActionBar><Button mode="contained" icon="plus" disabled={care.busy} onPress={() => setFormOpen(true)} style={[s.createButton, componentStyles.buttonShape]} contentStyle={s.createContent} labelStyle={s.createLabel}>Tạo lịch chăm sóc</Button></BottomActionBar>
    <CareScheduleForm visible={formOpen} onClose={() => setFormOpen(false)} plants={plants} plantId={plantId} plantLoading={plantLoading} plantError={plantError} onRetryPlants={loadPlants} onAddPlant={() => { setFormOpen(false); router.push("/customer/garden/add"); }} busy={care.busy} error={care.error} onSave={save} />
    <Portal><Dialog visible={!!deleting} onDismiss={() => !care.busy && setDeleting(null)} style={[componentStyles.dialog, s.dialog]}><Dialog.Icon icon="calendar-remove-outline" /><Dialog.Title style={s.dialogTitle}>Dừng lịch chăm sóc?</Dialog.Title><Dialog.Content><Text style={s.dialogText}>Tất cả lần lặp của “{deleting?.title}” sẽ dừng lại. Bạn có thể tạo lịch mới bất cứ lúc nào.</Text>{!!care.error && <Text style={s.errorText}>{care.error}</Text>}</Dialog.Content><Dialog.Actions><Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} disabled={care.busy} onPress={() => setDeleting(null)}>Giữ lịch</Button><Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} textColor={colors.statusError} loading={care.busy} disabled={care.busy} onPress={async () => { const current = scope.capture(); if (await care.remove(deleting.schedule_id) && current()) setDeleting(null); }}>Dừng lịch</Button></Dialog.Actions></Dialog></Portal>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 17,
    backgroundColor: colors.background,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center"
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 23,
    lineHeight: 32,
    fontWeight: "700",
    letterSpacing: -0.3
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20
  },
  iconControl: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: colors.border
  },
  pressed: {
    opacity: 0.7
  },
  disabled: {
    opacity: 0.4
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 22,
    gap: 20,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center"
  },
  calendar: {
    backgroundColor: "white",
    borderRadius: radius.card,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12
  },
  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6
  },
  monthTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary
  },
  todayButton: {
    paddingHorizontal: 12,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: colors.softMintBg,
    justifyContent: "center"
  },
  todayText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    color: colors.primaryLight
  },
  weekNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  weekArrow: {
    borderWidth: 0,
    width: 44,
    height: 44,
    backgroundColor: colors.background
  },
  rangeLabel: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20
  },
  dayStrip: {
    flexDirection: "row",
    gap: 3
  },
  day: {
    flex: 1,
    minWidth: 0,
    borderRadius: 15,
    alignItems: "center",
    paddingVertical: 12,
    gap: 9,
    backgroundColor: colors.background
  },
  daySelected: {
    backgroundColor: colors.primary
  },
  dayName: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
    fontWeight: "500"
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary
  },
  daySelectedText: {
    color: "white"
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "transparent"
  },
  segment: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 12,
    backgroundColor: colors.softMintBg,
    marginTop: 2
  },
  segmentItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    gap: 7,
    borderRadius: 9
  },
  segmentActive: {
    backgroundColor: "white",
    shadowColor: "#25482D",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1
  },
  segmentText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500"
  },
  segmentActiveText: {
    color: colors.primary,
    fontWeight: "700"
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 4
  },
  sectionCopy: {
    flex: 1,
    gap: 5
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
    letterSpacing: -0.2
  },
  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20
  },
  taskCount: {
    minWidth: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.lightMint
  },
  taskCountText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primaryLight
  },
  taskGroup: {
    gap: 12
  },
  groupHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 2
  },
  groupLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border
  },
  groupTitle: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    color: colors.textMuted
  },
  loading: {
    padding: 35,
    alignItems: "center",
    gap: 12
  },
  loadingText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.errorBackground
  },
  errorText: {
    color: colors.statusError,
    fontSize: 13,
    lineHeight: 20
  },
  flex: {
    flex: 1,
    minWidth: 0
  },
  retry: {
    alignSelf: "flex-start"
  },
  empty: {
    paddingHorizontal: 15,
    paddingVertical: 28,
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  emptyOrbit: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6
  },
  emptyIcon: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: colors.softMintBg,
    justifyContent: "center",
    alignItems: "center"
  },
  emptySpark: {
    position: "absolute",
    top: 7,
    right: 7,
    backgroundColor: "white",
    padding: 4,
    borderRadius: 10
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textMuted,
    textAlign: "center"
  },
  tip: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.softSproutBg
  },
  tipIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: "#E9E9D5",
    justifyContent: "center",
    alignItems: "center"
  },
  tipTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    marginBottom: 5
  },
  tipText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center"
  },
  createButton: {
    borderRadius: radius.input,
    backgroundColor: colors.primary
  },
  createContent: {
    minHeight: 53
  },
  createLabel: {
    fontSize: 14,
    fontWeight: "700"
  },
  dialog: {
    backgroundColor: "white",
    borderRadius: radius.sheet
  },
  dialogTitle: {
    textAlign: "center",
    color: colors.textPrimary,
    fontSize: 21
  },
  dialogText: {
    color: colors.textSecondary,
    lineHeight: 22,
    fontSize: 13
  }
});
