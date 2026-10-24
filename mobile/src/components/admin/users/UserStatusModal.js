import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { garden, getRoleMeta, leafShape } from "./theme";

export default function UserStatusModal({
  visible,
  targetUser,
  loading,
  onClose,
  onConfirm,
}) {
  const isCurrentlyActive = targetUser?.status !== false;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* HEADER */}
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={[
                  styles.confirmIconCircle,
                  isCurrentlyActive
                    ? { backgroundColor: garden.terracottaBg }
                    : { backgroundColor: garden.mint },
                ]}
              >
                <Ionicons
                  name={isCurrentlyActive ? "snow" : "leaf"}
                  size={20}
                  color={isCurrentlyActive ? garden.terracotta : garden.moss}
                />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.modalTitle}>
                  {isCurrentlyActive ? "Khóa tài khoản" : "Kích hoạt tài khoản"}
                </Text>
                <Text style={styles.modalSubtitle}>Xác nhận thay đổi trạng thái</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Đóng"
            >
              <Ionicons name="close" size={22} color={garden.forest} />
            </TouchableOpacity>
          </View>

          {/* BODY */}
          <View style={styles.modalBody}>
            <Text style={styles.confirmPromptText}>
              Bạn có chắc chắn muốn{" "}
              <Text style={{ fontWeight: "700" }}>
                {isCurrentlyActive ? "KHÓA TÀI KHOẢN" : "KÍCH HOẠT LẠI"}
              </Text>{" "}
              tài khoản:
            </Text>

            <View style={styles.confirmUserBox}>
              <Text style={styles.confirmUserName}>
                {targetUser?.fullName}
              </Text>
              <Text style={styles.confirmUserEmail}>
                {targetUser?.email}
              </Text>
            </View>

            <View
              style={[
                styles.noteBox,
                { backgroundColor: isCurrentlyActive ? garden.terracottaBg : garden.mint },
              ]}
            >
              <Ionicons
                name={isCurrentlyActive ? "warning-outline" : "checkmark-circle-outline"}
                size={18}
                color={isCurrentlyActive ? garden.terracotta : garden.moss}
              />
              <Text style={styles.confirmNoteText}>
                {isCurrentlyActive
                  ? "Sau khi bị khóa, tài khoản này sẽ bị từ chối truy cập và đăng nhập vào ứng dụng."
                  : "Sau khi kích hoạt, tài khoản này có thể đăng nhập và sử dụng ứng dụng bình thường."}
              </Text>
            </View>
          </View>

          {/* FOOTER */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                isCurrentlyActive
                  ? { backgroundColor: garden.terracotta }
                  : { backgroundColor: garden.moss },
              ]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>
                  {isCurrentlyActive ? "Xác nhận Khóa" : "Xác nhận Kích hoạt"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: garden.overlay,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    shadowColor: garden.forestDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 14,
    backgroundColor: garden.cream,
    borderBottomWidth: 1,
    borderBottomColor: garden.line,
  },
  confirmIconCircle: {
    ...leafShape(42),
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: garden.mint,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    padding: 18,
  },
  confirmPromptText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  confirmUserBox: {
    backgroundColor: garden.cream,
    borderWidth: 1,
    borderColor: garden.line,
    borderRadius: 16,
    padding: 12,
    marginVertical: 12,
  },
  confirmUserName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  confirmUserEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  noteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 14,
    gap: 8,
  },
  confirmNoteText: {
    flex: 1,
    fontSize: 13,
    color: garden.inkSoft,
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: garden.line,
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: garden.mint,
  },
  cancelBtnText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  saveBtn: {
    flex: 1,
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
