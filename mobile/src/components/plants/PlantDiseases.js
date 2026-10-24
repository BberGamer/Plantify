// PlantDiseases.js - Khối giao diện PlantDiseases.

import { View, StyleSheet, TouchableOpacity } from "react-native";

import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function PlantDiseases(
  {
    plant,
  },
) {
  return plant.common_disease_ids?.length > 0 && <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Ionicons name="medkit-outline" size={18} color={colors.statusWarning} />
      <Text style={styles.sectionHeading}>Bệnh thường gặp</Text>
      <TouchableOpacity style={styles.viewAllBtn}>
        <Text style={styles.viewAllText}>Xem bệnh</Text>
        <Ionicons name="chevron-forward" size={13} color={colors.primaryLight} />
      </TouchableOpacity>
    </View>
    <View style={styles.diseaseList}>
      {plant.common_disease_ids.map(
        diseaseId => <TouchableOpacity key={diseaseId.toString()} style={styles.diseaseItem} activeOpacity={0.75}>
          <View style={styles.diseaseIconBox}>
            <Ionicons name="bug-outline" size={16} color={colors.statusWarning} />
          </View>
          <Text style={styles.diseaseName}>{diseaseId.toString()}</Text>
          <Ionicons name="chevron-forward" size={15} color={colors.textMuted} />
        </TouchableOpacity>,
      )}
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

  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  viewAllText: {
    fontSize: 12,
    color: colors.primaryLight,
    fontWeight: "600",
  },

  // Disease
  diseaseList: {
    gap: 8,
  },

  diseaseItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warmPeachBg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },

  diseaseIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  diseaseName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
});
