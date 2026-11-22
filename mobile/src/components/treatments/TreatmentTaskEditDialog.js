import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Dialog, HelperText, TextInput } from "react-native-paper";
import { spacing } from "../../theme";
import DateTimePickerField from "../common/DateTimePickerField";

const vietnamDateKey = (value) =>
  new Date(new Date(value).getTime() + 7 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

export default function TreatmentTaskEditDialog({
  task,
  busy,
  serverError,
  scheduleStart,
  scheduleEnd,
  onDismiss,
  onSave,
}) {
  const [form, setForm] = useState({
    title: "",
    scheduled_date: "",
    time: "08:00",
    instructions: "",
    dosage_note: "",
    important_note: "",
  });
  const [error, setError] = useState("");
  const minimumDate = scheduleStart ? vietnamDateKey(scheduleStart) : undefined;
  const maximumDate = scheduleEnd ? vietnamDateKey(scheduleEnd) : undefined;

  useEffect(() => {
    if (!task) return;
    setForm({
      title: task.title || "",
      scheduled_date: vietnamDateKey(task.scheduled_date),
      time: task.time || "08:00",
      instructions: task.instructions || "",
      dosage_note: task.dosage_note || "",
      important_note: task.important_note || "",
    });
    setError("");
  }, [task]);

  const change = (field) => (value) =>
    setForm((current) => ({ ...current, [field]: value }));

  async function submit() {
    if (!form.title.trim() || !form.instructions.trim()) {
      setError("Tiêu đề và hướng dẫn không được để trống.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.scheduled_date)) {
      setError("Ngày thực hiện phải có định dạng YYYY-MM-DD.");
      return;
    }
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(form.time)) {
      setError("Giờ thực hiện phải có định dạng HH:mm.");
      return;
    }
    setError("");
    await onSave({
      title: form.title.trim(),
      scheduled_date: form.scheduled_date,
      time: form.time,
      instructions: form.instructions.trim(),
      dosage_note: form.dosage_note.trim(),
      important_note: form.important_note.trim(),
    });
  }

  return (
    <Dialog visible={Boolean(task)} onDismiss={onDismiss} dismissable={!busy}>
      <Dialog.Title>Chỉnh sửa công việc điều trị</Dialog.Title>
      <Dialog.ScrollArea style={styles.scrollArea}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <TextInput mode="outlined" label="Tiêu đề" value={form.title} onChangeText={change("title")} maxLength={200} disabled={busy} />
          <View style={styles.dateTimeRow}>
            <DateTimePickerField
              type="date"
              label="Ngày thực hiện"
              value={form.scheduled_date}
              minimum={minimumDate}
              maximum={maximumDate}
              disabled={busy}
              onChange={change("scheduled_date")}
            />
            <View style={styles.timeField}>
              <DateTimePickerField
                type="time"
                label="Giờ thực hiện"
                value={form.time}
                disabled={busy}
                onChange={change("time")}
              />
            </View>
          </View>
          <TextInput mode="outlined" label="Hướng dẫn" value={form.instructions} onChangeText={change("instructions")} multiline maxLength={2000} disabled={busy} />
          <TextInput mode="outlined" label="Liều lượng / lượng nước / dụng cụ" value={form.dosage_note} onChangeText={change("dosage_note")} multiline maxLength={2000} disabled={busy} />
          <TextInput mode="outlined" label="Lưu ý quan trọng" value={form.important_note} onChangeText={change("important_note")} multiline maxLength={2000} disabled={busy} />
          {!!(error || serverError) && (
            <HelperText type="error" visible>{error || serverError}</HelperText>
          )}
        </ScrollView>
      </Dialog.ScrollArea>
      <Dialog.Actions>
        <Button onPress={onDismiss} disabled={busy}>Hủy</Button>
        <Button onPress={submit} loading={busy} disabled={busy}>Lưu thay đổi</Button>
      </Dialog.Actions>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  scrollArea: { maxHeight: 520 },
  form: { gap: spacing.md, paddingVertical: spacing.md },
  dateTimeRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  timeField: { width: 150 },
});
