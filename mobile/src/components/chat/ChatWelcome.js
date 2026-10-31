import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../../theme";

const SUGGESTIONS = [
  { icon: "leaf-outline", text: "Vì sao lá cây bị vàng?", background: colors.lightMint },
  { icon: "water-outline", text: "Bao lâu nên tưới cây?", background: colors.lightMint },
  { icon: "sunny-outline", text: "Chọn cây cho góc ít sáng", background: colors.warmPeachBg },
  { icon: "flower-outline", text: "Cách chăm cây mới mua", background: colors.softPurpleBg },
];

export default function ChatWelcome() {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.halo}>
          <View style={styles.leaf}>
            <Ionicons name="leaf" size={42} color={colors.primary} />
          </View>
          <View style={styles.sparkle}>
            <MaterialCommunityIcons name="creation" size={21} color="#7C3AED" />
          </View>
        </View>
        <Text style={styles.eyebrow}>TRỢ LÝ CHĂM CÂY CỦA BẠN</Text>
        <Text style={styles.heading}>Cùng bạn chăm cây mỗi ngày</Text>
        <Text style={styles.description}>
          Từ chiếc lá nhỏ đến góc vườn xanh, cùng khám phá cách để cây luôn khỏe mạnh.
        </Text>
      </View>
      <Text style={styles.sectionTitle}>Bạn đang quan tâm điều gì?</Text>
      <View style={styles.suggestions}>
        {SUGGESTIONS.map((item) => (
          <View key={item.text} style={styles.card}>
            <View style={[styles.icon, { backgroundColor: item.background }]}>
              <Ionicons name={item.icon} size={20} color={colors.primary} />
            </View>
            <Text style={styles.suggestionText}>{item.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", maxWidth: 560, alignSelf: "center" },
  hero: { alignItems: "center", marginBottom: spacing.xxxl },
  halo: { width: 112, height: 112, borderRadius: 56, backgroundColor: colors.softMintBg, alignItems: "center", justifyContent: "center", marginBottom: spacing.xxl },
  leaf: { width: 82, height: 82, borderRadius: 28, backgroundColor: colors.white, alignItems: "center", justifyContent: "center", transform: [{ rotate: "-8deg" }] },
  sparkle: { position: "absolute", right: 0, top: 4, width: 36, height: 36, borderRadius: 14, backgroundColor: colors.softPurpleBg, borderWidth: 3, borderColor: colors.background, alignItems: "center", justifyContent: "center" },
  eyebrow: { ...typography.caption, fontWeight: "700", letterSpacing: 1.1, color: colors.accentGreen, textAlign: "center", marginBottom: spacing.md },
  heading: { fontSize: 28, lineHeight: 36, fontWeight: "800", letterSpacing: -0.7, color: colors.textPrimary, textAlign: "center", maxWidth: 300 },
  description: { ...typography.body, color: colors.textSecondary, textAlign: "center", marginTop: spacing.md, maxWidth: 340 },
  sectionTitle: { ...typography.label, color: colors.textPrimary, marginBottom: spacing.md },
  suggestions: { gap: spacing.sm },
  card: { flexDirection: "row", alignItems: "center", padding: spacing.md, gap: spacing.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card },
  icon: { width: 38, height: 38, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  suggestionText: { ...typography.label, flex: 1, color: colors.textPrimary },
});
