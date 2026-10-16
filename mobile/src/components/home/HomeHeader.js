import React from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, IconButton, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { colors } from "../../theme/colors";
import useAuthStore from "../../../store/authStore";

export default function HomeHeader() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleAvatarPress = () => {
    Alert.alert(
      user ? `Xin chào, ${user.fullName || "Người dùng"}!` : "Tài khoản",
      user ? `Email: ${user.email}\nVai trò: ${user.role || "customer"}` : "Bạn chưa đăng nhập",
      [
        { text: "Đóng", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

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
          <IconButton icon="bell-outline" iconColor="#183B2B" size={20} style={styles.bellButton} />
          <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
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
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: "row",
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