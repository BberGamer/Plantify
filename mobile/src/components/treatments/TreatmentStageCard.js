import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../../theme";

export default function TreatmentStageCard({ stage, initiallyExpanded = false }) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  return (
    <View style={styles.card}>
      <Pressable
        style={styles.header}
        onPress={() => setExpanded((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`Giai đoạn ${stage.order}: ${stage.title}`}
      >
        <View style={styles.number}><Text style={styles.numberText}>{stage.order}</Text></View>
        <View style={styles.heading}>
          <Text style={styles.title}>{stage.title}</Text>
          <Text style={styles.days}>Ngày {stage.start_day}–{stage.end_day}</Text>
        </View>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
      </Pressable>
      {expanded && <View style={styles.content}>
        {stage.instructions.map((instruction, index) => (
          <View key={`${stage._id}-${index}`} style={styles.instruction}>
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.primaryLight} />
            <Text style={styles.body}>{instruction}</Text>
          </View>
        ))}
        {!!stage.important_note && <Text style={styles.note}>Lưu ý: {stage.important_note}</Text>}
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, overflow: "hidden" },
  header: { minHeight: 64, flexDirection: "row", alignItems: "center", padding: spacing.lg, gap: spacing.md },
  number: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: colors.lightMint },
  numberText: { ...typography.label, color: colors.primary },
  heading: { flex: 1, minWidth: 0 },
  title: { ...typography.label, color: colors.textPrimary },
  days: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  content: { borderTopWidth: 1, borderTopColor: colors.borderLight, padding: spacing.lg, gap: spacing.md },
  instruction: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  body: { ...typography.body, flex: 1, color: colors.textSecondary },
  note: { ...typography.caption, color: "#946017", backgroundColor: colors.warmPeachBg, borderRadius: radius.sm, padding: spacing.md },
});
