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

const ROLE_OPTIONS = [
  {
    key: "customer",
    title: getRoleMeta("customer").label,
    description: "Người trồng cây · khách hàng sử dụng ứng dụng",
  },
  {
    key: "manager",
    title: getRoleMeta("manager").label,
    description: "Người chăm vườn · quản lý nội dung & cây cảnh",
  },
  {
    key: "admin",
    title: getRoleMeta("admin").label,
    description: "Người giữ rừng · toàn quyền quản trị hệ thống",
  },
];

export default function UserRoleModal({
  visible,
  targetUser,
  selectedRole,
  onSelectRole,
  submitting,
  onClose,
  onConfirm,
}) {
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
            <View>
              <Text style={styles.modalTitle}>Phân quyền vai trò</Text>
              <Text style={styles.modalSubtitle} numberOfLines={1}>
                Tài khoản: {targetUser?.fullName}
              </Text>
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
            {ROLE_OPTIONS.map((item) => {
              const isSelected = selectedRole === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.roleOptionCard,
                    isSelected && styles.roleOptionCardSelected,
                  ]}
                  onPress={() => onSelectRole(item.key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.roleOptionLeft}>
                    <View
                      style={[
                        styles.roleLeaf,
                        { backgroundColor: getRoleMeta(item.key).bg },
                      ]}
                    >
                      <Ionicons
                        name={getRoleMeta(item.key).icon}
                        size={20}
                        color={getRoleMeta(item.key).color}
                      />
                    </View>
                    <View style={{ marginLeft: 12, flexShrink: 1 }}>
                      <Text
                        style={[
                          styles.roleOptionTitle,
                          isSelected && { color: garden.forest },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text style={styles.roleOptionSub}>{item.description}</Text>
                    </View>
                  </View>

                  <Ionicons
                    name={isSelected ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={isSelected ? garden.forest : garden.muted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* FOOTER */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={onConfirm}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>Lưu vai trò</Text>
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
  roleOptionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: garden.line,
    backgroundColor: garden.cream,
    marginBottom: 10,
  },
  roleOptionCardSelected: {
    borderWidth: 2,
    borderColor: garden.moss,
    backgroundColor: colors.softMintBg,
  },
  roleOptionLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  roleLeaf: {
    ...leafShape(42),
    justifyContent: "center",
    alignItems: "center",
  },
  roleOptionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  roleOptionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
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
    backgroundColor: colors.primary,
  },
  saveBtnText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
