// PlantEmptyState.js - Phân biệt danh sách trống và tìm kiếm không có kết quả.
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";

export default function PlantEmptyState({ search }) {
  const searching = Boolean(search.trim());
  return (
    <View style={styles.container}>
      <Ionicons
        name={searching ? "search-outline" : "leaf-outline"}
        size={40}
        color={colors.textMuted}
      />
      <Text style={styles.title}>
        {searching ? "Không tìm thấy cây phù hợp" : "Chưa có cây trồng"}
      </Text>
      <Text style={styles.subtitle}>
        {searching
          ? "Thử từ khóa khác hoặc xóa nội dung tìm kiếm."
          : "Thêm loài cây đầu tiên của bạn."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 5,
    textAlign: "center",
  },
});
