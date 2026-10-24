import { spacing, radius } from "../../theme/tokens";
// LoginAlternatives.js - Khối giao diện LoginAlternatives.

import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
export default function LoginAlternatives({ onGoogleLogin, disabled }) {
  return (
    <>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
        <View style={styles.dividerLine} />
      </View>
      <TouchableOpacity
        style={styles.googleButton}
        onPress={onGoogleLogin}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Ionicons
          name="logo-google"
          size={18}
          color="#EA4335"
          style={{
            marginRight: spacing.sm,
          }}
        />
        <Text style={styles.googleButtonText}>Tiếp tục với Google</Text>
      </TouchableOpacity>
    </>
  );
}
const styles = StyleSheet.create({
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: 13,
    color: colors.textMuted,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: radius.sm,
    borderWidth: 1.2,
    borderColor: colors.inputBorder,
    backgroundColor: colors.white,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
  },
});
