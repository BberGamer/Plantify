import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { garden } from "./theme";

export default function UserHeader({ totalUsers = 0, onRefresh, onBack }) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <Ionicons name="arrow-back" size={22} color={garden.forest} />
        </TouchableOpacity>

        <Text style={styles.eyebrowText}>Quản lý tài khoản</Text>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onRefresh}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Làm mới danh sách"
        >
          <Ionicons name="reload" size={20} color={garden.forest} />
        </TouchableOpacity>
      </View>

      <Text style={styles.headerTitle}>Người dùng</Text>

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
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 5,
  },
  eyebrowText: {
    color: garden.inkSoft,
    fontSize: 12,
    fontWeight: "600",
  },
  headerTitle: {
    marginTop: 16,
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
