import { componentStyles } from "../../theme/componentStyles";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import ImageWithFallback from "./ImageWithFallback";
import { colors, radius, spacing, typography } from "../../theme";

export default function PhotoUploadField({ label, uri, onChoose, onRemove, disabled, loading,
  hint, chooseLabel = "Chọn ảnh từ máy", removeLabel = "Bỏ ảnh đã chọn" }) {
  return <View style={styles.group}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    {uri ? <ImageWithFallback uri={uri} style={styles.preview} resizeMode="contain" accessibilityLabel={label || "Ảnh đã chọn"} />
      : <View style={styles.empty}><Text style={styles.hint}>Chưa có ảnh được chọn</Text></View>}
    <Button mode="outlined" icon="image-plus" style={componentStyles.buttonShape} contentStyle={componentStyles.button}
      onPress={onChoose} disabled={disabled} loading={loading}>{chooseLabel}</Button>
    {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    {onRemove ? <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
      onPress={onRemove} disabled={disabled}>{removeLabel}</Button> : null}
  </View>;
}
const styles = StyleSheet.create({
  group: { gap: spacing.md, marginBottom: spacing.lg },
  label: { ...typography.label, color: colors.textPrimary },
  hint: { ...typography.caption, color: colors.textSecondary },
  preview: { width: "100%", height: 200, borderRadius: radius.card, backgroundColor: colors.lightMint },
  empty: { minHeight: 100, borderWidth: 1, borderStyle: "dashed", borderColor: colors.inputBorder,
    borderRadius: radius.card, alignItems: "center", justifyContent: "center", backgroundColor: colors.white },
});
