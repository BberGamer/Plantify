// PlantDetailHeader.js - Khối giao diện PlantDetailHeader.

import { View, StyleSheet, TouchableOpacity } from "react-native";

import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function PlantDetailHeader(
  {
    saved,
    canSave,
    onBack,
    onToggleSaved,
  },
) {
  return (
    <View style={styles.floatingHeader}>
      <TouchableOpacity style={styles.circleBtn} onPress={() => onBack()}>
        <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.floatingTitle}>Chi tiết cây</Text>
      <TouchableOpacity
        style={[styles.circleBtn, saved && styles.circleBtnActive]}
        onPress={onToggleSaved}
        disabled={!canSave}>
        <Ionicons
          name={saved ? "bookmark" : "bookmark-outline"}
          size={20}
          color={saved ? "#FFFFFF" : colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Header
  floatingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
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

  circleBtnActive: {
    backgroundColor: colors.primary,
  },

  floatingTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
});
