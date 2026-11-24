import { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors, radius, spacing, typography } from "../../theme";

const dateFromKey = (value) => {
  const [year, month, day] = String(value).split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

const timeFromText = (value) => {
  const [hours, minutes] = String(value).split(":").map(Number);
  return new Date(2000, 0, 1, hours, minutes, 0, 0);
};

const dateKey = (value) =>
  [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, "0"),
    String(value.getDate()).padStart(2, "0"),
  ].join("-");

const timeText = (value) =>
  `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;

export default function DateTimePickerField({
  type,
  label,
  value,
  disabled,
  minimum,
  maximum,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const isDate = type === "date";

  if (Platform.OS === "web") {
    return (
      <View style={styles.webField}>
        <Text style={styles.webLabel}>{label}</Text>
        <input
          type={type}
          value={value}
          min={isDate ? minimum : undefined}
          max={isDate ? maximum : undefined}
          step={type === "time" ? 60 : undefined}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
          style={webInputStyle}
        />
      </View>
    );
  }

  const selected = isDate ? dateFromKey(value) : timeFromText(value);
  const handleChange = (event, nextValue) => {
    if (Platform.OS === "android") setOpen(false);
    if (event.type === "dismissed" || !nextValue) return;
    onChange(isDate ? dateKey(nextValue) : timeText(nextValue));
  };

  return (
    <View style={styles.nativeField}>
      <Pressable onPress={() => !disabled && setOpen(true)} disabled={disabled}>
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label={label}
            value={value}
            editable={false}
            disabled={disabled}
            right={
              <TextInput.Icon
                icon={isDate ? "calendar-outline" : "clock-outline"}
              />
            }
          />
        </View>
      </Pressable>
      {open && (
        <View style={styles.pickerBox}>
          <DateTimePicker
            value={selected}
            mode={type}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={isDate && minimum ? dateFromKey(minimum) : undefined}
            maximumDate={isDate && maximum ? dateFromKey(maximum) : undefined}
            is24Hour
            onChange={handleChange}
          />
          {Platform.OS === "ios" && (
            <Button onPress={() => setOpen(false)}>Xong</Button>
          )}
        </View>
      )}
    </View>
  );
}

const webInputStyle = {
  width: "100%",
  height: 56,
  padding: "16px 14px 8px",
  border: `1px solid ${colors.border}`,
  borderRadius: radius.md,
  backgroundColor: colors.white,
  color: colors.textPrimary,
  fontSize: 16,
  outlineColor: colors.primary,
  boxSizing: "border-box",
};

const styles = StyleSheet.create({
  nativeField: { flex: 1 },
  webField: { flex: 1, minWidth: 120, position: "relative" },
  webLabel: {
    ...typography.caption,
    position: "absolute",
    zIndex: 1,
    left: 12,
    top: 4,
    color: colors.textMuted,
  },
  pickerBox: {
    marginTop: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    overflow: "hidden",
  },
});
