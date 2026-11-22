import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

const CARE_META = {
  light: { icon: "sunny-outline", label: "Ánh sáng" },
  water: { icon: "water-outline", label: "Tưới nước" },
  temperature: { icon: "thermometer-outline", label: "Nhiệt độ" },
  humidity: { icon: "partly-sunny-outline", label: "Độ ẩm" },
  soil: { icon: "earth-outline", label: "Đất trồng" },
  fertilizer: { icon: "leaf-outline", label: "Phân bón" },
};

const readableValue = (value) => {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(readableValue).filter(Boolean).join(" · ");
  if (value && typeof value === "object")
    return Object.values(value).map(readableValue).filter(Boolean).join(" · ");
  return "";
};

export default function PlantCareRequirements({ requirements }) {
  const [expanded, setExpanded] = useState(null);
  const careEntries = Object.entries(requirements || {})
    .filter(([key, value]) => CARE_META[key] && readableValue(value));

  if (!careEntries.length) return null;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="leaf" size={19} color={colors.primary} />
        <Text style={styles.sectionHeading}>Hướng dẫn chăm sóc</Text>
      </View>
      <View style={styles.list}>
        {careEntries.map(([key, value]) => {
          const meta = CARE_META[key];
          const open = expanded === key;
          return (
            <View key={key} style={[styles.item, open && styles.itemOpen]}>
              <Pressable
                style={styles.itemHeader}
                onPress={() => setExpanded(open ? null : key)}
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
                accessibilityLabel={`${meta.label}. ${open ? "Thu gọn" : "Mở chi tiết"}`}
              >
                <View style={styles.iconBox}>
                  <Ionicons name={meta.icon} size={24} color={colors.primary} />
                </View>
                <Text style={styles.label}>{meta.label}</Text>
                <Ionicons
                  name={open ? "chevron-up" : "chevron-down"}
                  size={22}
                  color={colors.textMuted}
                />
              </Pressable>
              {open && (
                <View style={styles.detail}>
                  <Text style={styles.value}>{readableValue(value)}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginHorizontal: 14, marginTop: 14, gap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 4 },
  sectionHeading: { flex: 1, fontSize: 17, fontWeight: "800", color: colors.textPrimary },
  list: { gap: 12 },
  item: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    shadowColor: "#144D37",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  itemOpen: { borderColor: "#CFE8DA" },
  itemHeader: { minHeight: 76, flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  iconBox: { width: 48, height: 48, borderRadius: 15, backgroundColor: colors.softMintBg, alignItems: "center", justifyContent: "center" },
  label: { flex: 1, fontSize: 16, fontWeight: "800", color: colors.textPrimary },
  detail: { borderTopWidth: 1, borderTopColor: colors.borderLight, padding: 16, paddingLeft: 74, gap: 5 },
  value: { fontSize: 14, lineHeight: 22, color: colors.textSecondary },
});
