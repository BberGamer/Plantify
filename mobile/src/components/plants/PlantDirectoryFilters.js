// PlantDirectoryFilters.js - Khối giao diện PlantDirectoryFilters.

import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";

import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function PlantDirectoryFilters(
  {
    categories,
    activeCategoryId,
    value,
    onSearchChange,
    onSearchClear,
    onSelectCategory,
  },
) {
  return <><View style={styles.searchWrapper}>
      <Ionicons
        name="search-outline"
        size={18}
        color={colors.textMuted}
        style={{
          marginRight: 8,
        }} />
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm theo tên thường hoặc tên khoa học..."
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onSearchChange}
        returnKeyType="search" />
      {value.length > 0 && <TouchableOpacity onPress={onSearchClear}>
        <Ionicons name="close-circle" size={18} color={colors.textMuted} />
      </TouchableOpacity>}
    </View><View style={styles.chipRow}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContainer}>
        {categories.map(cat => {
          const isActive = activeCategoryId === cat._id;

          return (
            <TouchableOpacity
              key={cat._id}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onSelectCategory(cat._id)}
              activeOpacity={0.8}>
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {cat.category_name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View></>;
}

const styles = StyleSheet.create({
  // Search
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 46,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },

  // Chips
  chipRow: {
    backgroundColor: "#FFFFFF",
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  chipContainer: {
    paddingHorizontal: 16,
    flexDirection: "row",
  },

  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },

  chipActive: {
    backgroundColor: colors.primary,
  },

  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  chipTextActive: {
    color: "#FFFFFF",
  },
});
