import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../../theme";

export function FilterRow({ children, style, accessibilityLabel }) {
  return <View accessibilityLabel={accessibilityLabel} style={[filterStyles.row, style]}>{children}</View>;
}

export function FilterOptions({ options, value, onChange, disabled, style, accessibilityLabel }) {
  return <FilterRow style={style} accessibilityLabel={accessibilityLabel}>
    {options.map(option => <FilterChip key={option.value} selected={value === option.value}
      disabled={disabled || option.disabled} icon={option.icon} onPress={() => onChange(option.value)}>
      {option.label}
    </FilterChip>)}
  </FilterRow>;
}

export function FilterChip({ selected, disabled, onPress, children, icon, accessibilityLabel }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button"
      {...(Platform.OS === "web" ? { "aria-pressed": Boolean(selected), "aria-disabled": Boolean(disabled) } : {})}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: Boolean(selected), disabled: Boolean(disabled) }}
      style={({ pressed, hovered }) => [filterStyles.chip, selected && filterStyles.selected,
        hovered && !disabled && filterStyles.hovered, pressed && filterStyles.pressed, disabled && filterStyles.disabled]}>
      {selected || icon ? <Ionicons name={selected ? "checkmark" : icon} size={16}
        color={selected ? colors.primary : colors.textSecondary} accessible={false} /> : null}
      <Text style={[filterStyles.label, selected && filterStyles.selectedLabel]}>{children}</Text>
    </Pressable>
  );
}

export function FilterMenuButton({ count = 0, expanded, onPress, accessibilityLabel, disabled }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button"
      {...(Platform.OS === "web" ? { "aria-expanded": Boolean(expanded), "aria-disabled": Boolean(disabled) } : {})}
      accessibilityLabel={accessibilityLabel || `Lọc: ${count} bộ lọc đang áp dụng`}
      accessibilityState={{ expanded: Boolean(expanded), disabled: Boolean(disabled) }}
      style={({ pressed }) => [filterStyles.menuButton, count > 0 && filterStyles.selected,
        pressed && filterStyles.pressed, disabled && filterStyles.disabled]}>
      <Ionicons name="options-outline" size={20} color={colors.primary} />
      <Text style={filterStyles.selectedLabel}>Lọc</Text>
      {count > 0 ? <Text style={filterStyles.count}>{count}</Text> : null}
    </Pressable>
  );
}

export const filterStyles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.sm },
  toolbar: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  search: { flex: 1, minWidth: 0 },
  chip: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    minHeight: 44, maxWidth: "100%", paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.input, backgroundColor: colors.white },
  selected: { backgroundColor: colors.lightMint, borderColor: colors.primaryLight },
  label: { ...typography.label, color: colors.textSecondary, flexShrink: 1 },
  selectedLabel: { ...typography.label, color: colors.primary },
  hovered: { borderColor: colors.primaryLight },
  pressed: { backgroundColor: colors.softMintBg },
  disabled: { opacity: 0.5 },
  menuButton: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingHorizontal: spacing.md, borderRadius: radius.input, borderWidth: 1,
    borderColor: colors.inputBorder, backgroundColor: colors.white, flexShrink: 0 },
  count: { ...typography.caption, color: colors.white, backgroundColor: colors.primary,
    minWidth: 22, borderRadius: radius.sm, textAlign: "center", paddingHorizontal: spacing.xs },
  menu: { borderRadius: radius.card, backgroundColor: colors.white, minWidth: 230 },
  menuHeading: { ...typography.caption, color: colors.textSecondary,
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xs },
  menuSelectedTitle: { color: colors.primary, fontWeight: "700" },
});
