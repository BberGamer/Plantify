import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";
import { colors } from "../../theme/colors";

export default function AccountLockedDialog({ visible, onDismiss }) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <ScrollView bounces={false} style={styles.scroll}>
          <LinearGradient
            colors={["#15803D", "#166534"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View
              style={styles.brandIcon}
              importantForAccessibility="no-hide-descendants"
              accessibilityElementsHidden
            >
              <Ionicons name="leaf" size={24} color={colors.white} />
            </View>
            <Text variant="titleLarge" style={styles.brand}>Plantify</Text>
          </LinearGradient>
          <View style={styles.content}>
            <Text variant="titleLarge" accessibilityRole="header" style={styles.title}>
              Tài khoản đã bị khóa
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Vui lòng liên hệ Plantify để được hỗ trợ mở khóa tài khoản.
            </Text>
            <View style={styles.contact}>
              <Text variant="labelLarge" style={styles.contactLabel}>Hỗ trợ qua Zalo</Text>
              <Text variant="headlineSmall" style={styles.phone} selectable>0337774204</Text>
            </View>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Button mode="contained" onPress={onDismiss} contentStyle={styles.buttonContent}>
            Đóng
          </Button>
        </View>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    alignSelf: "center",
    width: "90%",
    maxWidth: 420,
    maxHeight: "85%",
    marginHorizontal: 0,
    paddingTop: 0,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  scroll: {
    marginTop: 0,
    flexGrow: 0,
    flexShrink: 1,
  },
  header: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.22)",
  },
  brand: {
    color: colors.white,
    fontWeight: "700",
  },
  content: {
    padding: 24,
    gap: 12,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  description: {
    color: colors.textSecondary,
  },
  contact: {
    marginTop: 4,
    gap: 4,
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.primaryLight,
    backgroundColor: colors.lightMint,
  },
  contactLabel: {
    color: colors.accentGreen,
    fontWeight: "600",
    textAlign: "center",
  },
  phone: {
    color: colors.primary,
    fontWeight: "700",
    textAlign: "center",
  },
  footer: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  buttonContent: {
    minHeight: 44,
  },
});
