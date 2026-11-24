import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, paperTheme, radius, spacing } from "../../theme";

export default function SearchField({
  value = "", onChangeText, onClear, placeholder = "Tìm kiếm…",
  accessibilityLabel = placeholder, disabled = false, style, onFocus, onBlur,
  ...inputProps
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.field, focused && styles.focused, disabled && styles.disabled, style]}>
      <Ionicons name="search-outline" size={20} color={colors.textSecondary} accessible={false} />
      <TextInput
        autoCapitalize="none" autoCorrect={false} returnKeyType="search"
        {...inputProps} value={value} onChangeText={onChangeText}
        editable={!disabled && inputProps.editable !== false}
        placeholder={placeholder} placeholderTextColor={colors.textMuted}
        accessibilityLabel={accessibilityLabel} style={styles.input}
        onFocus={(event) => { setFocused(true); onFocus?.(event); }}
        onBlur={(event) => { setFocused(false); onBlur?.(event); }}
      />
      {value.length > 0 && !disabled && inputProps.editable !== false ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Xóa tìm kiếm"
          onPress={() => onClear ? onClear() : onChangeText?.("")}
          style={({ pressed }) => [styles.clear, pressed && styles.pressed]}>
          <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: spacing.sm,
    paddingLeft: spacing.md, paddingRight: spacing.xs, borderWidth: 1,
    borderColor: colors.inputBorder, borderRadius: radius.input, backgroundColor: colors.white },
  focused: { borderColor: colors.primary },
  disabled: { opacity: 0.55 },
  input: { flex: 1, minWidth: 0, minHeight: 46, paddingVertical: spacing.md,
    paddingRight: spacing.sm, fontFamily: paperTheme.fonts.bodyLarge.fontFamily,
    fontSize: 16, lineHeight: 22, color: colors.textPrimary },
  clear: { width: 44, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: radius.sm },
  pressed: { backgroundColor: colors.softMintBg },
});
