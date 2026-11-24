import { KeyboardAvoidingView, Modal, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, layout, radius } from "../../theme";

// Callback đóng được truyền từ domain để giữ nguyên chính sách pending/permission.
export function FormModalFrame({ visible, onRequestClose, children }) {
  return <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onRequestClose}>
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  </Modal>;
}

export function BottomSheetFrame({ visible, onRequestClose, children, style, animationType = "slide" }) {
  return <Modal visible={visible} transparent animationType={animationType} onRequestClose={onRequestClose}>
    <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <SafeAreaView edges={["bottom", "left", "right"]} style={[styles.sheet, style]}>{children}</SafeAreaView>
    </KeyboardAvoidingView>
  </Modal>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  overlay: { flex: 1, backgroundColor: colors.overlay, alignItems: "center", justifyContent: "flex-end" },
  sheet: { width: "100%", maxWidth: layout.detail, maxHeight: "90%", backgroundColor: colors.white,
    borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, overflow: "hidden" },
});
