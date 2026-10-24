import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import { colors } from "../../theme/colors";

export default function ProfileHeader() {
  const router = useRouter();
  const segments = useSegments();

  const handleBack = () => {
    if (segments[0] === "admin") {
      router.navigate("/admin");
    } else if (segments[0] === "manager") {
      router.navigate("/manager");
    } else {
      router.navigate("/(tabs)");
    }
  };

  return (
      <View style={styles.header}>
        {/* Về đúng Home kể cả khi mở thẳng đường dẫn profile, không cần lịch sử back. */}
        <Pressable
          onPress={handleBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Về trang chủ"
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color={colors.primaryText} />
        </Pressable>
        <Text style={styles.headerTitle}>Hồ sơ của tôi</Text>
        {/* Giữ tiêu đề nằm giữa, cân đối với nút quay lại bên trái. */}
        <View style={styles.headerSpacer} />
      </View>
  );
}

// Style riêng của component.
const styles = StyleSheet.create({
header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.lightMint,
    alignItems: "center",
    justifyContent: "center",
  },
headerSpacer: { width: 44 },
headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    color: colors.primaryText,
  }
});
