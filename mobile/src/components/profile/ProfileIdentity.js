import { spacing } from "../../theme/tokens";

import { View, StyleSheet } from "react-native";
import { Text, Avatar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function ProfileIdentity({ user }) {
  const fullName = user?.fullName?.trim() || "";
  const email = user?.email?.trim() || "";
  // Avatar được tính từ hai từ cuối của tên thật, không dùng tên/ảnh mẫu.
  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((word) => Array.from(word)[0])
    .join("")
    .toUpperCase();
  return (
        <View style={styles.identityCard}>
          <View
            style={styles.decorLeaf}
            pointerEvents="none"
            accessible={false}
          >
            <Ionicons name="leaf-outline" size={112} color="#D8EDDF" />
          </View>
          {/* Nếu chưa có tên, dùng icon trung tính thay vì tạo chữ viết tắt giả. */}
          {initials ? (
            <Avatar.Text
              size={80}
              label={initials}
              style={styles.avatar}
              color={colors.white}
            />
          ) : (
            <Avatar.Icon
              size={80}
              icon="account-outline"
              style={styles.avatar}
              color={colors.white}
            />
          )}
          <Text style={styles.name}>{fullName || "Chưa cập nhật họ tên"}</Text>
          <Text style={styles.email}>{email || "Chưa cập nhật email"}</Text>
        </View>
  );
}

// Style riêng của component.
const styles = StyleSheet.create({
identityCard: {
    alignItems: "center",
    padding: spacing.xxl,
    borderRadius: 24,
    backgroundColor: colors.lightMint,
    overflow: "hidden",
  },
decorLeaf: {
    position: "absolute",
    right: -20,
    top: -10,
    transform: [{ rotate: "-25deg" }],
  },
avatar: {
    backgroundColor: colors.avatarBg,
    borderWidth: 4,
    borderColor: colors.white,
  },
name: {
    marginTop: 14,
    fontSize: 23,
    fontWeight: "800",
    color: colors.primaryText,
    textAlign: "center",
  },
email: {
    marginTop: 5,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  }
});
