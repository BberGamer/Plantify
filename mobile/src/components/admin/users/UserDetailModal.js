import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { garden, getRoleMeta, leafShape } from "./theme";

const SYSTEM_ROLES = ["customer", "manager", "admin"];

export default function UserDetailModal({
  visible,
  user,
  fullName,
  onChangeFullName,
  phone,
  onChangePhone,
  role,
  onChangeRole,
  status,
  onChangeStatus,
  submitting,
  onClose,
  onSave,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalCard}>
          {/* MODAL HEADER */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.headerLeaf}>
                <Ionicons name={getRoleMeta(user?.role).icon} size={20} color={garden.white} />
              </View>
              <View style={{ flexShrink: 1 }}>
                <Text style={styles.modalTitle}>Chi tiết tài khoản</Text>
                <Text style={styles.modalSubtitle}>Xem & vun đắp thông tin</Text>
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

          {/* MODAL BODY */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalBody}
          >
            {user ? (
              <>
                <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Mã User (ID):</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>
                    {user._id}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValueBold}>{user.email}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ngày tạo:</Text>
                  <Text style={styles.infoValue}>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleString("vi-VN")
                      : "—"}
                  </Text>
                </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Họ và tên *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={fullName}
                    onChangeText={onChangeFullName}
                    placeholder="Nhập họ và tên"
                    placeholderTextColor={garden.muted}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Số điện thoại</Text>
                  <TextInput
                    style={styles.formInput}
                    value={phone}
                    onChangeText={onChangePhone}
                    placeholder="Nhập số điện thoại (10 chữ số)"
                    placeholderTextColor={garden.muted}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Vai trò hệ thống</Text>
                  <View style={styles.rolePickerRow}>
                    {SYSTEM_ROLES.map((r) => {
                      const isActive = role === r;
                      return (
                        <TouchableOpacity
                          key={r}
                          style={[
                            styles.roleChoiceBtn,
                            isActive && styles.roleChoiceBtnActive,
                          ]}
                          onPress={() => onChangeRole(r)}
                        >
                          <Text
                            style={[
                              styles.roleChoiceText,
                              isActive && styles.roleChoiceTextActive,
                            ]}
                          >
                            {r.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Trạng thái hoạt động</Text>
                  <View style={styles.rolePickerRow}>
                    <TouchableOpacity
                      style={[
                        styles.roleChoiceBtn,
                        status === true && styles.statusChoiceActive,
                      ]}
                      onPress={() => onChangeStatus(true)}
                    >
                      <Text
                        style={[
                          styles.roleChoiceText,
                          status === true && styles.statusChoiceTextActive,
                        ]}
                      >
                        HOẠT ĐỘNG
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.roleChoiceBtn,
                        status === false && styles.statusChoiceBanned,
                      ]}
                      onPress={() => onChangeStatus(false)}
                    >
                      <Text
                        style={[
                          styles.roleChoiceText,
                          status === false && styles.statusChoiceTextActive,
                        ]}
                      >
                        BỊ KHÓA
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            ) : null}
          </ScrollView>

          {/* MODAL FOOTER */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Đóng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={onSave}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: "90%",
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  headerLeaf: {
    ...leafShape(42),
    backgroundColor: garden.moss,
    justifyContent: "center",
    alignItems: "center",
  },
  infoCard: {
    backgroundColor: garden.cream,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: garden.line,
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    color: colors.textPrimary,
    maxWidth: "65%",
  },
  infoValueBold: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    maxWidth: "65%",
  },
  inputGroup: {
    marginTop: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  formInput: {
    height: 48,
    borderWidth: 1,
    borderColor: garden.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: garden.cream,
  },
  rolePickerRow: {
    flexDirection: "row",
    gap: 8,
  },
  roleChoiceBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: garden.line,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: garden.cream,
  },
  roleChoiceBtnActive: {
    backgroundColor: garden.forest,
    borderColor: garden.forest,
  },
  roleChoiceText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  roleChoiceTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  statusChoiceActive: {
    backgroundColor: garden.moss,
    borderColor: garden.moss,
  },
  statusChoiceBanned: {
    backgroundColor: garden.terracotta,
    borderColor: garden.terracotta,
  },
  statusChoiceTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
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
