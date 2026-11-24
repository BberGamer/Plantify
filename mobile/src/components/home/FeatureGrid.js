import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { colors, radius, spacing, typography } from "../../theme";

const FEATURES = [
  { title: "Nhận diện cây", href: "/customer/identification", subtitle: "Tìm tên cây từ ảnh", icon: "leaf-outline" },
  { title: "Chẩn đoán bệnh", href: "/customer/diagnosis", subtitle: "Kiểm tra dấu hiệu lạ", icon: "medkit-outline" },
  { title: "Vườn của tôi", href: "/customer/garden", subtitle: "Theo dõi cây đang trồng", icon: "flower-outline" },
  { title: "Trợ lý AI", href: "/customer/chat", subtitle: "Hỏi đáp về chăm cây", icon: "chatbubbles-outline" },
];

export default function FeatureGrid() {
  const router = useRouter();
  return <View style={styles.section}>
    <Text accessibilityRole="header" style={styles.heading}>Chăm cây cùng Plantify</Text>
    <View style={styles.grid}>
      {FEATURES.map(item => <Pressable key={item.href} accessibilityRole="button"
        accessibilityLabel={`${item.title}. ${item.subtitle}`}
        onPress={() => router.navigate(item.href)}
        style={({ pressed, hovered }) => [styles.card, hovered && styles.hovered, pressed && styles.pressed]}>
        <View style={styles.top}><View style={styles.icon}><Ionicons name={item.icon} size={24} color={colors.primary} /></View>
          <Ionicons name="arrow-forward" size={18} color={colors.textSecondary} /></View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </Pressable>)}
    </View>
  </View>;
}
const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xxxl
  },
  heading: {
    ...typography.section,
    color: colors.textPrimary,
    marginBottom: spacing.lg
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  card: {
    flexBasis: "46%",
    flexGrow: 1,
    minWidth: 130,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white
  },
  hovered: {
    borderColor: colors.primaryLight,
    transform: [{
      translateY: -2
    }]
  },
  pressed: {
    backgroundColor: colors.lightMint,
    transform: [{
      scale: 0.98
    }]
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.softMintBg,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    ...typography.label,
    color: colors.textPrimary
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs
  }
});
