import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { garden } from "./theme";

export default function UserHeader({ totalUsers = 0, onAdd }) {
  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Text style={styles.headerTitle}>Người dùng</Text>
        <TouchableOpacity
          style={[styles.iconButton, styles.addButton]}
          onPress={onAdd}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Thêm người dùng"
        >
          <Ionicons name="add" size={28} color={garden.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.statRow}>
        <View style={styles.statPill}>
          <Ionicons name="people" size={14} color={garden.forest} />
          <Text style={styles.statValue}>{totalUsers}</Text>
          <Text style={styles.statLabel}>tài khoản</Text>
        </View>
        <Text style={styles.headerSubtitle}>Kết quả trong danh sách</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: garden.white,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: garden.line,
    overflow: "hidden",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: garden.forest,
    borderRadius: 12,
  },
  titleRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    color: garden.ink,
    letterSpacing: 0.2,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: garden.mint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "800",
    color: garden.forest,
  },
  statLabel: {
    fontSize: 12,
    color: garden.forest,
    fontWeight: "500",
  },
  headerSubtitle: {
    flex: 1,
    fontSize: 13,
    color: garden.inkSoft,
  },
});
