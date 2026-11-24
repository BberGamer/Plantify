import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../../theme";
import { componentStyles } from "../../theme/componentStyles";

export default function DetailField({ label, value, emptyText = "Chưa có thông tin", style, copyValue }) {
  const missing = value === null || value === undefined || value === "";
  const [copyStatus, setCopyStatus] = useState("");
  const pending = useRef(false);
  const generation = useRef(0);
  useEffect(() => {
    ++generation.current;
    setCopyStatus("");
    return () => { ++generation.current; };
  }, [copyValue]);
  const canCopy = typeof copyValue === "string" && copyValue.length > 0;
  const copy = async () => {
    if (!canCopy || pending.current) return;
    pending.current = true;
    const current = generation.current;
    try {
      // APK cũ thiếu native module vẫn mở được màn hình và có thể sao chép thủ công.
      const Clipboard = require("expo-clipboard");
      const copied = await Clipboard.setStringAsync(copyValue, { android: { isSensitive: true } });
      if (current === generation.current) setCopyStatus(copied ? "success" : "error");
    } catch {
      if (current === generation.current) setCopyStatus("error");
    } finally {
      pending.current = false;
    }
  };
  return <View style={[styles.field, style]}>
    <View style={styles.labelRow}>
      <Text style={[styles.label, styles.flex]}>{label}</Text>
      {canCopy ? <Button compact icon={copyStatus === "success" ? "check" : "content-copy"}
        onPress={copy} accessibilityLabel={`Sao chép ${label.toLowerCase()}`}
        style={componentStyles.buttonShape} contentStyle={componentStyles.button}>
        {copyStatus === "success" ? "Đã sao chép" : "Sao chép"}
      </Button> : null}
    </View>
    <Text selectable style={styles.value}>{missing ? emptyText : value}</Text>
    {copyStatus ? <Text accessibilityLiveRegion="polite" style={copyStatus === "error" ? styles.error : styles.copied}>
      {copyStatus === "error" ? "Không thể sao chép. Bạn có thể nhấn giữ hoặc chọn nội dung để sao chép." : "Đã sao chép vào bộ nhớ tạm."}
    </Text> : null}
  </View>;
}

export function DetailRow({ icon, label, value, emptyText, action, style }) {
  return <View style={[styles.row, style]}>
    {icon ? <View style={styles.icon}><Ionicons name={icon} size={20} color={colors.primary} accessible={false} /></View> : null}
    <DetailField label={label} value={value} emptyText={emptyText} style={styles.flex} />
    {action}
  </View>;
}
const styles = StyleSheet.create({
  field: { gap: spacing.xs, minWidth: 0 },
  labelRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.xs },
  label: { ...typography.caption, color: colors.textSecondary, fontWeight: "600" },
  value: { ...typography.body, color: colors.textPrimary, flexShrink: 1 },
  copied: { ...typography.caption, color: colors.primary },
  error: { ...typography.caption, color: colors.statusError },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md },
  flex: { flex: 1, minWidth: 0 },
  icon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.lightMint,
    alignItems: "center", justifyContent: "center" },
});
