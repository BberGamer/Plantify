// PlantSearchBar.js - Giao diện PlantSearchBar của màn hình quản lý cây.
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";

export default function PlantSearchBar({ value, onChange }) {
  return (
    <View style={styles.searchBox}>
      <Ionicons name="search-outline" size={19} color={colors.textSecondary} />
      <TextInput
        style={styles.searchInput}
        value={value}
        accessibilityLabel="Tìm cây trồng"
        onChangeText={onChange}
        placeholder="Tìm cây trồng..."
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    paddingHorizontal: 13,
    height: 46,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    marginLeft: 9,
  },
});
