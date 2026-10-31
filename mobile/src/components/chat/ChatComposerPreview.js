import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, control, radius, spacing, typography } from "../../theme";

export default function ChatComposerPreview() {
  return (
    <View style={styles.footer}>
      <View style={styles.content}>
        <View style={styles.composer}>
          <Text style={styles.placeholder}>Hỏi về cây của bạn…</Text>
          <View
            accessible
            accessibilityRole="button"
            accessibilityLabel="Gửi tin nhắn"
            accessibilityState={{ disabled: true }}
            style={styles.send}
          >
            <Ionicons name="arrow-up" size={22} color={colors.textSecondary} />
          </View>
        </View>
        <Text style={styles.caption}>Giao diện xem trước • Chưa hỗ trợ gửi tin</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md, backgroundColor: colors.background },
  content: { width: "100%", maxWidth: 560, alignSelf: "center" },
  composer: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.sm, paddingLeft: spacing.lg, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  placeholder: { ...typography.body, flex: 1, color: colors.textSecondary },
  send: { width: control.touchSize, height: control.touchSize, borderRadius: 22, backgroundColor: colors.borderLight, alignItems: "center", justifyContent: "center" },
  caption: { ...typography.caption, textAlign: "center", color: colors.textSecondary, marginTop: spacing.sm },
});
