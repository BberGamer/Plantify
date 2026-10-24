import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";

export default function DiseaseEmptyState({ search, filtered }) {
  const hasFilter = Boolean(search.trim()) || filtered;
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons
          name={hasFilter ? "search-outline" : "bug-outline"}
          size={31}
          color={colors.textMuted}
        />
      </View>
      <Text style={styles.title}>
        {hasFilter ? "Không tìm thấy bệnh phù hợp" : "Chưa có bệnh cây"}
      </Text>
      <Text style={styles.subtitle}>
        {hasFilter
          ? "Thử từ khóa hoặc trạng thái khác."
          : "Danh mục bệnh cây hiện đang trống."}
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
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    marginTop: 13,
    textAlign: "center",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 5,
    textAlign: "center",
  },
});
