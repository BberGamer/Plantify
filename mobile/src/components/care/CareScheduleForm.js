import { useState } from "react";
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Switch, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { gardenToday } from "../../hooks/useCareTasks";

const INPUT_THEME = { roundness: 14, colors: { background: "#FBFCFA", outline: "#E2E9E2" } };
function Field(props) {
  return <TextInput mode="outlined" theme={INPUT_THEME} style={s.input} outlineStyle={s.outline} {...props} />;
}
function Section({ number, title, children }) {
  return <View style={s.section}><View style={s.sectionHeading}><Text style={s.number}>{number}</Text><Text style={s.sectionTitle}>{title}</Text></View>{children}</View>;
}

export default function CareScheduleForm({ visible, onClose, plants, plantId, plantLoading, plantError, onRetryPlants, onAddPlant, busy, error, onSave }) {
  const [selectedPlant, setSelectedPlant] = useState(plantId || "");
  const [action, setAction] = useState("watering");
  const [title, setTitle] = useState("");
  const [start, setStart] = useState(gardenToday);
  const [end, setEnd] = useState("");
  const [hasEnd, setHasEnd] = useState(false);
  const [time, setTime] = useState("08:00");
  const [repeat, setRepeat] = useState("1");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const available = plants.filter(p => !plantId || p._id === plantId);
  const selected = available.find(p => p._id === selectedPlant);
  async function save() {
    const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
    if (!selected || selected.active_treatment) return setFormError("Hãy chọn một cây không trong đợt điều trị.");
    if (!validDate(start) || (hasEnd && (!validDate(end) || end < start))) return setFormError("Ngày cần có dạng YYYY-MM-DD; ngày kết thúc từ ngày bắt đầu trở đi.");
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return setFormError("Nhập giờ hợp lệ, ví dụ 08:00 hoặc 17:30.");
    if (!/^\d+$/.test(repeat) || +repeat < 1 || +repeat > 365) return setFormError("Chu kỳ lặp từ 1 đến 365 ngày.");
    setFormError("");
    const ok = await onSave({ user_plant_id: selectedPlant, action_type: action,
      title: title.trim() || (action === "watering" ? "Tưới nước" : "Bón phân"),
      start_date: start, end_date: hasEnd ? end : null, time, repeat_every_days: +repeat, notes });
    if (ok) { setTitle(""); setNotes(""); setFormError(""); }
  }
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={() => !busy && onClose()}>
    <View style={s.overlay}>
      <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Đóng biểu mẫu" disabled={busy} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.sheet}>
        <View style={s.handle} />
        <View style={s.header}><View style={s.headerCopy}><Text style={s.eyebrow}>MỘT THÓI QUEN NHỎ, MỘT KHU VƯỜN XANH</Text><Text style={s.heading}>Tạo lịch chăm sóc</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Đóng" onPress={onClose} disabled={busy} style={s.close}><Ionicons name="close" size={22} color={colors.textPrimary} /></Pressable></View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <Section number="01" title="Bạn muốn chăm cây nào?">
            {plantLoading ? <ActivityIndicator /> : plantError ? <><Text style={s.error}>{plantError}</Text><Button onPress={onRetryPlants}>Tải lại danh sách cây</Button></> : !available.length ? <><Text style={s.help}>Vườn của bạn chưa có cây để tạo lịch.</Text><Button onPress={onAddPlant} icon="plus">Thêm cây vào vườn</Button></> : <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.plants}>
              {available.map(p => {
                const disabled = busy || Boolean(p.active_treatment);
                const chosen = selectedPlant === p._id;
                return <Pressable key={p._id} disabled={disabled} accessibilityRole="button" accessibilityLabel={p.plant_nickname} accessibilityState={{ selected: chosen, disabled }} onPress={() => setSelectedPlant(p._id)} style={[s.plant, chosen && s.plantSelected, disabled && s.dimmed]}>
                  {p.display_image_url ? <Image source={{ uri: p.display_image_url }} style={s.plantPhoto} /> : <View style={s.plantPhoto}><Ionicons name="leaf-outline" size={25} color={colors.primaryLight} /></View>}
                  {chosen && <View style={s.check}><Ionicons name="checkmark" size={12} color="white" /></View>}
                  <Text numberOfLines={2} style={[s.plantName, chosen && { color: colors.primary }]}>{p.plant_nickname}</Text>
                  {!!p.active_treatment && <Text style={s.treatment}>Đang điều trị</Text>}
                </Pressable>;
              })}
            </ScrollView>}
          </Section>
          <Section number="02" title="Cây cần bạn làm gì?">
            <View style={s.row}>{[{ id: "watering", title: "Tưới nước", subtitle: "Thêm chút tươi mát", icon: "water-outline", color: "#5C94C2", bg: "#EDF5FC" }, { id: "fertilizing", title: "Bón phân", subtitle: "Nuôi dưỡng mỗi ngày", icon: "leaf-outline", color: "#9476B5", bg: "#F4F0FB" }].map(item => <Pressable key={item.id} accessibilityRole="button" accessibilityState={{ selected: action === item.id, disabled: busy }} disabled={busy} onPress={() => setAction(item.id)} style={[s.action, action === item.id && s.actionSelected]}>
              <View style={[s.actionIcon, { backgroundColor: item.bg }]}><Ionicons name={item.icon} size={24} color={item.color} /></View>
              <Text style={s.actionTitle}>{item.title}</Text><Text style={s.actionSubtitle}>{item.subtitle}</Text>
              {action === item.id && <Ionicons name="checkmark-circle" size={18} color={colors.primaryLight} style={s.actionCheck} />}
            </Pressable>)}</View>
            <Field disabled={busy} label="Tên công việc (tùy chọn)" placeholder={action === "watering" ? "Ví dụ: Tưới nhẹ quanh gốc" : "Ví dụ: Bón phân hữu cơ"} value={title} onChangeText={setTitle} maxLength={200} />
          </Section>
          <Section number="03" title="Lên một nhịp chăm sóc">
            <View style={s.row}><View style={s.flex}><Field disabled={busy} label="Ngày bắt đầu" placeholder="YYYY-MM-DD" value={start} onChangeText={setStart} maxLength={10} autoCapitalize="none" left={<TextInput.Icon icon="calendar-outline" />} /></View><View style={s.time}><Field disabled={busy} label="Vào lúc" placeholder="08:00" value={time} onChangeText={setTime} maxLength={5} keyboardType="numbers-and-punctuation" /></View></View>
            <Text style={s.help}>Ngày theo dạng năm-tháng-ngày · Giờ Việt Nam</Text>
            <Text style={s.label}>Lặp lại</Text>
            <View style={s.wrap}>{[1, 2, 7, 14, 30].map(n => <Pressable key={n} disabled={busy} accessibilityRole="button" accessibilityState={{ selected: repeat === String(n), disabled: busy }} onPress={() => setRepeat(String(n))} style={[s.preset, repeat === String(n) && s.presetSelected]}><Text style={[s.presetText, repeat === String(n) && s.presetTextSelected]}>{n === 1 ? "Hằng ngày" : `${n} ngày`}</Text></Pressable>)}</View>
            <Field disabled={busy} label="Hoặc tùy chỉnh số ngày lặp" value={repeat} onChangeText={setRepeat} keyboardType="number-pad" maxLength={3} right={<TextInput.Affix text="ngày" />} />
            <View style={s.switchRow}><View style={s.flex}><Text style={s.label}>Đặt ngày kết thúc</Text><Text style={s.help}>Tắt để duy trì lịch chăm sóc liên tục</Text></View><Switch value={hasEnd} onValueChange={setHasEnd} disabled={busy} color={colors.primaryLight} accessibilityLabel="Đặt ngày kết thúc" /></View>
            {hasEnd && <Field disabled={busy} label="Ngày kết thúc" placeholder="YYYY-MM-DD" value={end} onChangeText={setEnd} maxLength={10} left={<TextInput.Icon icon="calendar-outline" />} />}
          </Section>
          <Section number="04" title="Một chút lưu ý"><Field disabled={busy} label="Ghi chú (tùy chọn)" placeholder="Lượng nước, loại phân bón hoặc điều cần nhớ…" value={notes} onChangeText={setNotes} multiline numberOfLines={3} maxLength={1000} /></Section>
          <View style={s.info}><Ionicons name="shield-checkmark-outline" size={18} color={colors.primaryLight} /><Text style={s.infoText}>Lịch thường sẽ tự tạm dừng khi cây bước vào đợt điều trị.</Text></View>
          {!!(formError || error) && <Text accessibilityRole="alert" style={s.error}>{formError || error}</Text>}
        </ScrollView>
        <SafeAreaView edges={["bottom"]} style={s.bottom}><Button mode="contained" icon="plus" loading={busy} disabled={busy || plantLoading || !!plantError || !selected || !!selected.active_treatment} onPress={save} style={s.save} contentStyle={s.saveContent} labelStyle={s.saveLabel}>Tạo lịch cho cây</Button></SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  </Modal>;
}
const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(15, 39, 27, 0.42)", justifyContent: "flex-end", alignItems: "center", paddingTop: 45 },
  sheet: { width: "100%", maxWidth: 640, height: "94%", maxHeight: "100%", backgroundColor: "#FFFFFF", borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: "hidden", flexShrink: 1 },
  handle: { width: 38, height: 4, borderRadius: 3, backgroundColor: "#DDE6DD", alignSelf: "center", marginTop: 12 },
  header: { padding: 22, paddingBottom: 18, flexDirection: "row", alignItems: "center", gap: 8 }, headerCopy: { flex: 1, gap: 7 },
  eyebrow: { fontSize: 9, letterSpacing: 1, fontWeight: "700", color: "#7F9C88", lineHeight: 15 }, heading: { fontSize: 25, fontWeight: "800", color: colors.textPrimary },
  close: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#F2F6F1", alignItems: "center", justifyContent: "center" },
  content: { padding: 22, paddingTop: 4, gap: 25, paddingBottom: 24 },
  section: { gap: 12 }, sectionHeading: { flexDirection: "row", alignItems: "center", gap: 9 },
  number: { color: "#91A68F", fontSize: 11, fontWeight: "700", backgroundColor: "#F1F5EE", borderRadius: 7, padding: 6 }, sectionTitle: { fontWeight: "700", color: colors.textPrimary, fontSize: 15, flex: 1 },
  plants: { gap: 10, paddingBottom: 2 }, plant: { width: 108, borderWidth: 1, borderColor: "#E5ECE3", borderRadius: 17, padding: 12, alignItems: "center", gap: 8 },
  plantSelected: { borderColor: "#58956E", backgroundColor: "#F0F7EF" }, plantPhoto: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#E6F0E1", alignItems: "center", justifyContent: "center" },
  check: { position: "absolute", right: 23, top: 46, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: colors.primaryLight, borderWidth: 2, borderColor: "white" },
  plantName: { fontSize: 12, fontWeight: "600", textAlign: "center", color: "#748271" }, treatment: { color: "#9A8050", fontSize: 10 }, dimmed: { opacity: 0.5 },
  row: { flexDirection: "row", gap: 12 }, flex: { flex: 1, minWidth: 0 }, time: { width: 105 },
  action: { flex: 1, padding: 16, borderWidth: 1, borderColor: "#E5ECE3", borderRadius: 18, gap: 6 }, actionSelected: { backgroundColor: "#F7FAF4", borderColor: "#6F9E74" },
  actionIcon: { width: 43, height: 43, borderRadius: 13, justifyContent: "center", alignItems: "center", marginBottom: 5 }, actionTitle: { fontSize: 15, fontWeight: "700", color: colors.textPrimary }, actionSubtitle: { fontSize: 10, color: "#899281" }, actionCheck: { position: "absolute", top: 13, right: 12 },
  input: { fontSize: 13, backgroundColor: "#FBFCFA" }, outline: { borderRadius: 14 }, label: { fontSize: 13, color: colors.textPrimary, fontWeight: "600" }, help: { fontSize: 11, lineHeight: 17, color: "#8B9887" },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, preset: { paddingVertical: 11, paddingHorizontal: 13, borderRadius: 12, backgroundColor: "#F3F6F0", minHeight: 44, justifyContent: "center" }, presetSelected: { backgroundColor: colors.primary }, presetText: { fontSize: 12, color: "#7F8D77", fontWeight: "500" }, presetTextSelected: { color: "white" },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 }, info: { flexDirection: "row", gap: 8, padding: 14, backgroundColor: "#EFF6EB", borderRadius: 14, alignItems: "center" }, infoText: { flex: 1, fontSize: 11, lineHeight: 17, color: "#698063" }, error: { color: "#B3261E", fontSize: 13, lineHeight: 19 },
  bottom: { paddingHorizontal: 22, paddingTop: 14, paddingBottom: 12, borderTopWidth: 1, borderTopColor: "#EFF2EB" }, save: { borderRadius: 16 }, saveContent: { minHeight: 52 }, saveLabel: { fontSize: 14, fontWeight: "700" },
});
