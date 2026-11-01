import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, control, spacing, typography } from "../../theme";

export default function ChatHeader({ onBack }) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Quay lại"
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </Pressable>
      <View style={styles.avatar}>
        <MaterialCommunityIcons name="robot-happy-outline" size={23} color={colors.primary} />
      </View>
      <View style={styles.identity}>
        <Text style={styles.title}>Trợ lý AI</Text>
        <Text style={styles.subtitle}>Người bạn chăm cây</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md,
    paddingVertical: spacing.md, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  back: { width: control.touchSize, minHeight: control.touchSize, alignItems: "center", justifyContent: "center", borderRadius: 22 },
  pressed: { backgroundColor: colors.lightMint },
  avatar: { width: 44, height: 44, borderRadius: 16, backgroundColor: colors.lightMint, alignItems: "center", justifyContent: "center", marginLeft: spacing.xs },
  identity: { flex: 1, marginLeft: spacing.md },
  title: { ...typography.section, color: colors.textPrimary },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
