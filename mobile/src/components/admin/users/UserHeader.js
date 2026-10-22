import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { garden, leafShape } from "./theme";

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
      {/* La trang tri phia sau */}
      <View pointerEvents="none" style={[styles.decoLeaf, styles.decoLeafBig]} />
      <View pointerEvents="none" style={[styles.decoLeaf, styles.decoLeafSmall]} />
      <Ionicons
        pointerEvents="none"
        name="leaf"
        size={120}
        color="rgba(255,255,255,0.06)"
        style={styles.decoIcon}
      />

      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <Ionicons name="arrow-back" size={22} color={garden.white} />
        </TouchableOpacity>

        <View style={styles.eyebrow}>
          <Ionicons name="leaf" size={12} color="#A7F3D0" />
          <Text style={styles.eyebrowText}>Khu vườn Plantify</Text>
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onRefresh}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Làm mới danh sách"
        >
          <Ionicons name="reload" size={20} color={garden.white} />
        </TouchableOpacity>
      </View>

      <Text style={styles.headerTitle}>Cộng đồng người trồng cây</Text>

      <View style={styles.statRow}>
        <View style={styles.statPill}>
          <Ionicons name="people" size={14} color={garden.forest} />
          <Text style={styles.statValue}>{totalUsers}</Text>
          <Text style={styles.statLabel}>thành viên</Text>
        </View>
        <Text style={styles.headerSubtitle}>Vun đắp & quản lý tài khoản</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: garden.forest,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  decoLeaf: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  decoLeafBig: {
    ...leafShape(150),
    right: -40,
    top: -50,
    transform: [{ rotate: "20deg" }],
  },
  decoLeafSmall: {
    ...leafShape(70),
    right: 90,
    bottom: -30,
    transform: [{ rotate: "-15deg" }],
  },
  decoIcon: {
    position: "absolute",
    left: -30,
    bottom: -40,
    transform: [{ rotate: "-30deg" }],
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    color: "#D1FAE5",
    fontSize: 12,
    fontWeight: "600",
  },
  headerTitle: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: "800",
    color: garden.white,
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
    color: "rgba(255,255,255,0.78)",
  },
});
