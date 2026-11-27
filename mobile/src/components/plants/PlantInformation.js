// PlantInformation.js - Khối giao diện PlantInformation.

import { View, StyleSheet } from "react-native";

import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/tokens";

export default function PlantInformation({ plant }) {
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
        {plant.botanical_family ? (
          <>
            <View style={styles.identityDivider} />
            <View style={styles.identityMeta}>
              <Ionicons
                name="folder-outline"
                size={13}
                color={colors.textMuted}
              />
              <Text style={styles.identityMetaText}>
                {plant.botanical_family}
              </Text>
            </View>
          </>
        ) : null}
      </View>
      {}
      {plant.description ? (
        <>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>{plant.description}</Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // Identity card
  identityCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 14,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 0,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0,
    shadowRadius: 8,
  },
  commonName: {
    ...typography.title,
    fontWeight: "800",
    color: colors.textPrimary,
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
    fontSize: 13,
    lineHeight: 20,
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
    ...typography.section,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 26,
  },
});
