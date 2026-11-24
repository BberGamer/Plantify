import { spacing } from "../../theme/tokens";

import { View, StyleSheet } from "react-native";
import { Text, Avatar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfileIdentity({ user, finance }) {
  const vip =
    finance?.isproaccount && new Date(finance.vip_expires_at) > new Date();
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
    <LinearGradient
      colors={
        vip ? ["#123F31", "#27684E"] : [colors.lightMint, colors.lightMint]
      }
      style={[styles.identityCard, vip && styles.vipCard]}
    >
      <View style={styles.decorLeaf} pointerEvents="none" accessible={false}>
        <Ionicons
          name={vip ? "sparkles-outline" : "leaf-outline"}
          size={112}
          color={vip ? "#B79950" : "#D8EDDF"}
        />
      </View>
      {/* Nếu chưa có tên, dùng icon trung tính thay vì tạo chữ viết tắt giả. */}
      {initials ? (
        <Avatar.Text
          size={80}
          label={initials}
          style={[styles.avatar, vip && styles.vipAvatar]}
          color={colors.white}
        />
      ) : (
        <Avatar.Icon
          size={80}
          icon="account-outline"
          style={[styles.avatar, vip && styles.vipAvatar]}
          color={colors.white}
        />
      )}
      {vip && (
        <View style={styles.vipBadge}>
          <Ionicons name="ribbon" size={16} color="#795413" />
          <Text style={styles.vipLabel}>PLANTIFY {finance.vip_plan}</Text>
        </View>
      )}
      {finance && !vip && <Text style={styles.freeLabel}>Tài khoản Free</Text>}
      <Text style={[styles.name, vip && styles.vipName]}>
        {fullName || "Chưa cập nhật họ tên"}
      </Text>
      <Text style={[styles.email, vip && styles.vipEmail]}>
        {email || "Chưa cập nhật email"}
      </Text>
      {vip && (
        <Text style={styles.vipEmail}>
          Đặc quyền đến{" "}
          {new Date(
            new Date(finance.vip_expires_at).getTime() - 1,
          ).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
        </Text>
      )}
    </LinearGradient>
  );
}

// Style riêng của component.
const styles = StyleSheet.create({
  vipCard: {
    borderWidth: 1,
    borderColor: "#D6BA71"
  },
  vipAvatar: {
    borderColor: "#F2D790",
    backgroundColor: "#32745A"
  },
  vipBadge: {
    flexDirection: "row",
    gap: 5,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: "#F2D790",
    borderRadius: 20
  },
  vipLabel: {
    color: "#64470F",
    fontWeight: "800",
    fontSize: 13,
    lineHeight: 20
  },
  freeLabel: {
    marginTop: 14,
    color: colors.primary,
    fontWeight: "700"
  },
  vipName: {
    color: "#FFF5D8"
  },
  vipEmail: {
    color: "#DBEBDD",
    marginTop: 5,
    textAlign: "center"
  },
  identityCard: {
    alignItems: "center",
    padding: spacing.xxl,
    borderRadius: 24,
    backgroundColor: colors.lightMint,
    overflow: "hidden"
  },
  decorLeaf: {
    position: "absolute",
    right: -20,
    top: -10,
    transform: [{
      rotate: "-25deg"
    }]
  },
  avatar: {
    backgroundColor: colors.avatarBg,
    borderWidth: 4,
    borderColor: colors.white
  },
  name: {
    marginTop: 14,
    fontSize: 23,
    fontWeight: "800",
    color: colors.primaryText,
    textAlign: "center"
  },
  email: {
    marginTop: 5,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center"
  }
});
