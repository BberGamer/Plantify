import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, IconButton, Text } from "react-native-paper";
import useHomeHeader from "../../hooks/useHomeHeader";
import { colors } from "../../theme/colors";

export default function HomeHeader() {
  const { user, openAdmin, openAccountMenu, isLoggingOut, logoutError, roleLabel } = useHomeHeader();

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
          <IconButton icon="bell-outline" iconColor="#183B2B" size={20} style={styles.bellButton} />
          <TouchableOpacity onPress={openAccountMenu} disabled={isLoggingOut} activeOpacity={0.8}>
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

      {!!logoutError && <Text accessibilityRole="alert">{logoutError}</Text>}
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
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#183B2B",
    marginLeft: 8,
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  adminBadgeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
  },
  adminBadgeBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#E2E8E4",
    backgroundColor: "#FFFFFF",
    margin: 0,
    marginRight: 10,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.avatarBg,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  greetingSection: {
    marginTop: 10,
  },
  greetingSub: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.accentGreen,
    marginBottom: 4,
  },
  greetingMain: {
    fontSize: 24,
    fontWeight: "800",
    color: "#183B2B",
    lineHeight: 32,
    letterSpacing: -0.4,
  },
});
