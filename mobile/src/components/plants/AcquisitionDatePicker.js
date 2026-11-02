import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, HelperText, IconButton, Text } from "react-native-paper";
import { colors, spacing, radius } from "../../theme";
import { formatGardenDate, todayGardenDate } from "../../utils/gardenDate";

const dayValue = (year, month, day) => `${String(year).padStart(4, "0")}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
function monthDate(year, month, day = 1) {
  const date = new Date(0);
  date.setUTCFullYear(year, month, day);
  return date;
}

export default function AcquisitionDatePicker({ value, onChange, disabled, error }) {
  const [visible, setVisible] = useState(false);
  const [month, setMonth] = useState(() => todayGardenDate().slice(0, 7));
  const today = todayGardenDate();
  const [year, monthNumber] = month.split("-").map(Number);
  const index = monthNumber - 1;
  const offset = (monthDate(year, index).getUTCDay() + 6) % 7;
  const days = monthDate(year, index + 1, 0).getUTCDate();
  const shift = (amount) => {
    const date = monthDate(year, index + amount);
    setMonth(dayValue(date.getUTCFullYear(), date.getUTCMonth(), 1).slice(0, 7));
  };
  const choose = (date) => { onChange(date); setVisible(false); };
  return <View>
    <Text variant="labelLarge">Ngày nhận cây (không bắt buộc)</Text>
    <Button mode="outlined" icon="calendar-month-outline" disabled={disabled} onPress={() => {
      setMonth((value || today).slice(0, 7)); setVisible(true);
    }} accessibilityLabel={`Ngày nhận cây: ${formatGardenDate(value)}`} style={styles.trigger}>{formatGardenDate(value)}</Button>
    {!!error && <HelperText type="error">{error}</HelperText>}
    {!!value && <Button disabled={disabled} onPress={() => onChange("")}>Xóa ngày nhận cây</Button>}
    <Modal visible={visible && !disabled} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
      <View style={styles.overlay}>
        <ScrollView style={styles.dialog} contentContainerStyle={styles.dialogContent} accessibilityViewIsModal>
          <Text variant="titleLarge">Chọn ngày nhận cây</Text>
          <View style={styles.navigation}>
            <IconButton icon="chevron-double-left" accessibilityLabel="Năm trước" disabled={year <= 1} onPress={() => shift(-12)} />
            <IconButton icon="chevron-left" accessibilityLabel="Tháng trước" disabled={year === 1 && index === 0} onPress={() => shift(-1)} />
            <Text style={styles.month}>Tháng {monthNumber}/{year}</Text>
            <IconButton icon="chevron-right" accessibilityLabel="Tháng sau" disabled={month >= today.slice(0, 7)} onPress={() => shift(1)} />
            <IconButton icon="chevron-double-right" accessibilityLabel="Năm sau" disabled={year >= Number(today.slice(0, 4))} onPress={() => {
              const next = Math.min(year + 1, Number(today.slice(0, 4)));
              setMonth(dayValue(next, next === Number(today.slice(0, 4)) ? Math.min(index, Number(today.slice(5, 7)) - 1) : index, 1).slice(0, 7));
            }} />
          </View>
          <View style={styles.grid}>
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((label) => <View key={label} style={styles.cell}><Text>{label}</Text></View>)}
            {Array.from({ length: offset + days }, (_, position) => {
              const day = position - offset + 1;
              if (day < 1) return <View key={position} style={styles.cell} />;
              const date = dayValue(year, index, day);
              const future = date > today;
              const selected = date === value;
              return <Pressable key={position} disabled={future} accessibilityRole="button" accessibilityLabel={formatGardenDate(date)}
                accessibilityState={{ disabled: future, selected }} onPress={() => choose(date)}
                style={[styles.cell, selected && styles.selected]}><Text style={[future && styles.muted, selected && styles.selectedText]}>{day}</Text></Pressable>;
            })}
          </View>
          <Text variant="bodySmall">Chỉ chọn hôm nay hoặc ngày trong quá khứ.</Text>
          <View style={styles.actions}><Button onPress={() => choose(today)}>Hôm nay</Button><Button onPress={() => setVisible(false)}>Đóng</Button></View>
        </ScrollView>
      </View>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  trigger: { marginTop: spacing.sm, borderRadius: radius.md },
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)", padding: spacing.md },
  dialog: { width: "100%", maxWidth: 420, maxHeight: "90%", flexGrow: 0, borderRadius: radius.card, backgroundColor: colors.white },
  dialogContent: { padding: spacing.md, gap: spacing.sm },
  navigation: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  month: { flex: 1, textAlign: "center", fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: `${100 / 7}%`, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: radius.sm },
  selected: { backgroundColor: colors.primary },
  selectedText: { color: colors.white },
  muted: { color: colors.textMuted },
  actions: { flexDirection: "row", justifyContent: "flex-end" },
});
