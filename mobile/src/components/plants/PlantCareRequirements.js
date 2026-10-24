// PlantCareRequirements.js - Khối giao diện PlantCareRequirements.

import { View, StyleSheet } from "react-native";

import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function PlantCareRequirements(
  {
    requirements,
  },
) {
  // Bieu tuong cho tung yeu cau cham soc
  const CARE_ICONS = {
    light: {
      icon: "sunny-outline",
      label: "Ánh sáng",
    },

    water: {
      icon: "water-outline",
      label: "Tưới nước",
    },

    temperature: {
      icon: "thermometer-outline",
      label: "Nhiệt độ",
    },

    humidity: {
      icon: "partly-sunny-outline",
      label: "Độ ẩm",
    },

    soil: {
      icon: "earth-outline",
      label: "Đất trồng",
    },

    fertilizer: {
      icon: "leaf-outline",
      label: "Phân bón",
    },
  };

  const careEntries = Object.entries(requirements || {});

  return careEntries.length > 0 && <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Ionicons name="leaf" size={18} color={colors.primary} />
      <Text style={styles.sectionHeading}>Yêu cầu chăm sóc</Text>
    </View>
    <View style={styles.careGrid}>
      {careEntries.map(([key, value]) => {
        const meta = CARE_ICONS[key];

        if (!meta)
          return null;

        return (
          <View key={key} style={styles.careItem}>
            <View style={styles.careIconBox}>
              <Ionicons name={meta.icon} size={22} color={colors.primary} />
            </View>
            <Text style={styles.careLabel}>{meta.label}</Text>
            <Text style={styles.careValue} numberOfLines={2}>
              {value}
            </Text>
          </View>
        );
      })}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  // Section
  section: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 20,
    padding: 18,
    elevation: 2,
    shadowColor: "#144D37",

    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.06,
    shadowRadius: 5,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },

  sectionHeading: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  // Care grid
  careGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  careItem: {
    width: "30%",
    alignItems: "center",
    backgroundColor: colors.softMintBg,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },

  careIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#144D37",

    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.08,
    shadowRadius: 3,
  },

  careLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: "center",
  },

  careValue: {
    fontSize: 11.5,
    color: colors.textPrimary,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 16,
  },
});
