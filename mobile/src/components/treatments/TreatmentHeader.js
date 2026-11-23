import { StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { colors, spacing, typography } from "../../theme";

export default function TreatmentHeader({ title, onBack, actionIcon, onAction }) {
  return (
    <View style={styles.header}>
      <IconButton icon="arrow-left" onPress={onBack} accessibilityLabel="Quay lại" />
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      {actionIcon ? (
        <IconButton icon={actionIcon} onPress={onAction} accessibilityLabel="Tùy chọn" />
      ) : <View style={styles.placeholder} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xs,
  },
  title: { ...typography.section, flex: 1, color: colors.textPrimary, textAlign: "center" },
  placeholder: { width: 48 },
});
