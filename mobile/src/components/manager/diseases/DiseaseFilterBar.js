import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";

const OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "active", label: "Đang dùng" },
  { value: "inactive", label: "Tạm ẩn" },
];

export default function DiseaseFilterBar({
  search,
  status,
  onSearchChange,
  onStatusChange,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons
          name="search-outline"
          size={19}
          color={colors.textSecondary}
        />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={onSearchChange}
          accessibilityLabel="Tìm bệnh cây"
          placeholder="Tìm tên bệnh hoặc triệu chứng..."
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
        />
      </View>
      <View style={styles.segment}>
        {OPTIONS.map((option) => {
          const selected = status === option.value;
          return (
            <TouchableOpacity
              key={option.value || "all"}
              style={[styles.segmentItem, selected && styles.segmentSelected]}
              onPress={() => onStatusChange(option.value)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
            >
              <Text
                style={[
                  styles.segmentText,
                  selected && styles.segmentTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 18, marginBottom: 14 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    paddingHorizontal: 13,
    height: 46,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    marginLeft: 9,
  },
  segment: {
    flexDirection: "row",
    marginTop: 10,
    padding: 3,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: colors.borderLight,
  },
  segmentItem: {
    flex: 1,
    minHeight: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentSelected: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentText: { color: colors.textSecondary, fontSize: 12, fontWeight: "600" },
  segmentTextSelected: { color: colors.primary, fontWeight: "800" },
});
