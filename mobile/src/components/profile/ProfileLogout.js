import { spacing } from "../../theme/tokens";

import { StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import { colors } from "../../theme/colors";

export default function ProfileLogout({ saving, isLoggingOut, logoutError, handleLogout }) {
  return (<>
        {/* Khóa đăng xuất khi đang lưu để tránh xóa phiên giữa lúc cập nhật. */}
        <Button
          mode="outlined"
          icon="logout"

          style={styles.logoutButton}
          contentStyle={styles.logoutContent}
          labelStyle={styles.logoutLabel}
          loading={isLoggingOut}
          disabled={isLoggingOut || saving}
          onPress={handleLogout}
          accessibilityLabel="Đăng xuất tài khoản"
        >
          {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
        </Button>
        {logoutError ? (
          <Text style={styles.logoutError} accessibilityRole="alert">
            {logoutError}
          </Text>
        ) : null}
  </>);
}

// Style riêng của component.
const styles = StyleSheet.create({
logoutButton: {
    marginTop: spacing.xxl,
    borderRadius: 14,
    borderColor: colors.primary,
    backgroundColor: colors.lightMint,
  },
logoutContent: { minHeight: 48 },
logoutLabel: { fontSize: 14, fontWeight: "700" },
logoutError: {
    marginTop: 10,
    color: colors.statusError,
    fontSize: 12,
    textAlign: "center",
  }
});
