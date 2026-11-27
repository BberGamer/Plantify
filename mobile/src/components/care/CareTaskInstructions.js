import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { colors, spacing } from "../../theme";

export default function CareTaskInstructions({ task }) {
  const [expanded, setExpanded] = useState(false);
  const steps = Array.isArray(task.steps) ? task.steps : [];
  if (!steps.length) return task.notes ? <Text style={styles.notes}>{task.notes}</Text> : null;
  return (
    <View style={styles.steps}>
      {steps.map((step, index) => (
        <Text key={index} style={styles.body}>
          <Text style={styles.label}>Bước {index + 1}. </Text>{step}
        </Text>
      ))}
      {!!task.dose_note && (
        <Text style={styles.notes}>
          <Text style={styles.label}>{task.action_type === "watering" ? "Nước" : "Phân bón"} · </Text>
          {task.dose_note}
        </Text>
      )}
      {!!task.notes && (
        <>
          <Button mode="text" compact style={styles.details} accessibilityState={{ expanded }}
            onPress={() => setExpanded((value) => !value)}>
            {expanded ? "Ẩn hướng dẫn tham khảo" : "Xem hướng dẫn tham khảo"}
          </Button>
          {expanded && <Text style={styles.notes}>{task.notes}</Text>}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  steps: { gap: spacing.xs },
  body: { color: colors.textSecondary, lineHeight: 22 },
  label: { fontWeight: "700", color: colors.textPrimary },
  notes: { color: colors.textSecondary, lineHeight: 22, backgroundColor: colors.softMintBg, borderRadius: 10, padding: spacing.sm },
  details: { alignSelf: "flex-start" },
});
