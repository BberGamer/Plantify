// PlantInformation.js - Khối giao diện PlantInformation.

import { View, StyleSheet } from "react-native";

import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function PlantInformation(
  {
    plant,
  },
) {
  return (
    <View style={styles.identityCard}>
      <Text style={styles.commonName}>{plant.common_name}</Text>
      <View style={styles.identityRow}>
        <View style={styles.identityMeta}>
          <Ionicons name="flask-outline" size={13} color={colors.textMuted} />
          <Text style={styles.identityMetaText} numberOfLines={1}>
            {plant.scientific_name}
          </Text>
        </View>
        {plant.botanical_family ? <>
          <View style={styles.identityDivider} />
          <View style={styles.identityMeta}>
            <Ionicons name="folder-outline" size={13} color={colors.textMuted} />
            <Text style={styles.identityMetaText}>{plant.botanical_family}</Text>
          </View>
        </> : null}
      </View>
      {}
      {plant.description ? <>
        <Text style={styles.sectionTitle}>Mô tả</Text>
        <Text style={styles.description}>{plant.description}</Text>
      </> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // Identity card
  identityCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 14,
    marginTop: -20,
    borderRadius: 20,
    padding: 18,
    elevation: 4,
    shadowColor: "#144D37",

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  commonName: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 10,
  },

  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },

  identityMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },

  identityMetaText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: "italic",
    flex: 1,
  },

  identityDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.border,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },

  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
