// PlantDirectoryHeader.js - Khối giao diện PlantDirectoryHeader.

import { View, StyleSheet, TouchableOpacity } from "react-native";

import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function PlantDirectoryHeader(
  {
    onBack,
  },
) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.circleBtn} onPress={() => onBack()}>
        <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Danh mục cây</Text>
      <View style={styles.circleBtn}>
        <Ionicons name="options-outline" size={20} color={colors.textPrimary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.softMintBg,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
});
