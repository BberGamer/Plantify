import { spacing } from "../../theme/tokens";
// LoginAlternatives.js - Khối giao diện LoginAlternatives.

import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import GoogleSignInButton from "./GoogleSignInButton";
import { colors } from "../../theme/colors";
export default function LoginAlternatives({ onGoogleLogin, disabled }) {
  return (
    <>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
        <View style={styles.dividerLine} />
      </View>
      <GoogleSignInButton onCredential={onGoogleLogin} disabled={disabled} />
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
});
