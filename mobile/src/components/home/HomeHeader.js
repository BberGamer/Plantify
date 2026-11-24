import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, Badge, IconButton, Text } from "react-native-paper";
import useHomeHeader from "../../hooks/useHomeHeader";
import { colors } from "../../theme/colors";

export default function HomeHeader() {
  const {
    user,
    openAdmin,
    openProfile,
    openNotifications,
    unreadCount,
    roleLabel,
  } = useHomeHeader();

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(-2)
        .join("")
        .toUpperCase()
    : "PL";

  return (
    <View style={styles.container}>
      {/* TOP BAR */}
      <View style={styles.headerRow}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="leaf" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.logoText}>Plantify</Text>
        </View>

        <View style={styles.headerRight}>
          {user?.role === "admin" && (
            <TouchableOpacity
              style={styles.adminBadgeBtn}
              onPress={openAdmin}
              activeOpacity={0.8}
            >
              <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
              <Text style={styles.adminBadgeBtnText}>{roleLabel}</Text>
            </TouchableOpacity>
          )}
          <View style={styles.bellContainer}>
            <IconButton
              icon="bell-outline"
              accessibilityLabel={
                unreadCount > 0
                  ? `Mở thông báo, ${unreadCount} mục chưa đọc`
                  : "Mở thông báo"
              }
              onPress={openNotifications}
              iconColor={colors.textPrimary}
              size={20}
              style={styles.bellButton}
            />
            {unreadCount > 0 && (
              <View pointerEvents="none" style={styles.unreadBadge}>
                <Badge size={18}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={openProfile}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Mở hồ sơ cá nhân"
          >
            <Avatar.Text
              size={38}
              label={initials}
              color="#FFFFFF"
              style={styles.avatarButton}
              labelStyle={styles.avatarText}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* GREETING */}
      <View style={styles.greetingSection}>
        <Text style={styles.greetingSub}>
          {user ? `Xin chào, ${user.fullName}!` : "Xin chào, người yêu cây!"}
        </Text>
        <Text style={styles.greetingMain}>
          Hôm nay khu vườn của bạn{"\n"}thế nào?
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4
  },
  headerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center"
  },
  logoText: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginLeft: 8,
    letterSpacing: -0.3
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center"
  },
  adminBadgeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8
  },
  adminBadgeBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    marginLeft: 4
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FFFFFF",
    margin: 0,
    marginRight: 10
  },
  bellContainer: {
    position: "relative"
  },
  unreadBadge: {
    position: "absolute",
    top: -3,
    right: 4
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.avatarBg
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700"
  },
  greetingSection: {
    marginTop: 20
  },
  greetingSub: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.accentGreen,
    marginBottom: 4
  },
  greetingMain: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    lineHeight: 36,
    letterSpacing: -0.4
  }
});
