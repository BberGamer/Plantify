// PlantDetailHeader.js - Khối giao diện PlantDetailHeader.

import { View, StyleSheet, TouchableOpacity } from "react-native";

import { ActivityIndicator, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function PlantDetailHeader(
  {
    saved,
    showFavorite = false,
    busy = false,
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
      {showFavorite ? <TouchableOpacity
        style={[styles.circleBtn, saved && styles.circleBtnActive]}
        accessibilityRole="button"
        accessibilityLabel={saved ? "Bỏ yêu thích cây" : "Yêu thích cây"}
        accessibilityState={{ disabled: !canSave, selected: saved, busy }}
        onPress={onToggleSaved}
        disabled={!canSave}>
        {busy ? <ActivityIndicator size={20} color={colors.primary} /> : <Ionicons
          name={saved ? "heart" : "heart-outline"}
          size={20}
          color={saved ? "#FFFFFF" : colors.textPrimary} />}
      </TouchableOpacity> : <View style={styles.circlePlaceholder} />}
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.softMintBg,
    justifyContent: "center",
    alignItems: "center",
  },
  circlePlaceholder: { width: 44, height: 44 },

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
