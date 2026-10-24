// ResetSuccess.js - Khối giao diện ResetSuccess.

import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
export default function ResetSuccess({}) {
  return (
    <View style={styles.successScreen}>
      <View style={styles.successIconWrap}>
        <Ionicons name="checkmark-circle" size={72} color="#16A34A" />
      </View>
      <Text style={styles.successTitle}>Đặt lại mật khẩu thành công!</Text>
      <Text style={styles.successDesc}>
        Mật khẩu mới của bạn đã được cập nhật.{"\n"}
        Đang chuyển về trang đăng nhập...
      </Text>
      <ActivityIndicator
        size="small"
        color={colors.primary}
        style={{
          marginTop: 24,
        }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  // === Man hinh thanh cong ===
  successScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: "#FFFFFF",
  },
  successIconWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 12,
  },
  successDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
});
