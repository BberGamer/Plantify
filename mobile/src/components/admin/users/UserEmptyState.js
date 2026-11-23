import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { garden } from "./theme";

export default function UserEmptyState({
  title = "Không tìm thấy người dùng",
  subtitle = "Không tìm thấy người dùng phù hợp. Hãy thử đổi từ khóa hoặc bộ lọc nhé.",
}) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.potWrap}>
        <Ionicons name="people-outline" size={40} color={garden.moss} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySub}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
    paddingHorizontal: 24,
  },
  potWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: garden.mint,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: garden.ink,
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    lineHeight: 20,
    color: garden.inkSoft,
    marginTop: 6,
    textAlign: "center",
  },
});
