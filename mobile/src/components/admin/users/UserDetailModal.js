import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, radius, typography } from "../../../theme/tokens";

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import FormField from "../../common/FormField";
import { Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { garden, getRoleMeta, leafShape } from "./theme";

const SYSTEM_ROLES = ["customer", "manager", "admin"];

export default function UserDetailModal({
  currentAdminId,
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
  const readOnly = user?.role === "admin" && user?._id !== currentAdminId;
  const permissionsReadOnly = user?.role === "admin";
  const close = () => { if (!submitting) onClose(); };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <SafeAreaView edges={["bottom", "left", "right"]} style={styles.modalCard}>
          {/* MODAL HEADER */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.headerLeaf}>
                <Ionicons name={getRoleMeta(user?.role).icon} size={20} color={garden.white} />
              </View>
              <View style={{ flexShrink: 1 }}>
                <Text style={styles.modalTitle}>Chi tiết tài khoản</Text>
                <Text style={styles.modalSubtitle}>
                  {readOnly ? "Tài khoản cùng vai trò chỉ được xem" : "Xem và cập nhật thông tin"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              disabled={submitting} onPress={close}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Đóng"
            >
              <Ionicons name="close" size={22} color={garden.forest} />
            </TouchableOpacity>
          </View>

          {/* MODAL BODY */}
          <ScrollView keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalBody}
          >
            {user ? (
              <>
                <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Mã người dùng:</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>
                    {user._id}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Địa chỉ email:</Text>
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

                <FormField label="Họ và tên *" disabled={submitting || readOnly}

                    value={fullName}
                    onChangeText={onChangeFullName}
                    placeholder="Nhập họ và tên"
                    placeholderTextColor={garden.muted}
                  />

                <FormField label="Số điện thoại" disabled={submitting || readOnly}

                    value={phone}
                    onChangeText={onChangePhone}
                    placeholder="Nhập số điện thoại (10 chữ số)"
                    placeholderTextColor={garden.muted}
                    keyboardType="phone-pad"
                  />

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
                          disabled={submitting || user?.role === "admin"}
                          accessibilityRole="button"
                          accessibilityState={{ disabled: submitting || user?.role === "admin", selected: isActive }}
                          onPress={() => onChangeRole(r)}
                        >
                          <Text
                            style={[
                              styles.roleChoiceText,
                              isActive && styles.roleChoiceTextActive,
                            ]}
                          >
                            {getRoleMeta(r).label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {user?.role === "admin" && (
                    <Text style={styles.inputLabel}>Không thể thay đổi vai trò quản trị viên.</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Trạng thái hoạt động</Text>
                  <View style={styles.rolePickerRow}>
                    <TouchableOpacity
                      style={[
                        styles.roleChoiceBtn,
                        status === true && styles.statusChoiceActive,
                      ]}
                      disabled={submitting || permissionsReadOnly} onPress={() => onChangeStatus(true)}
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
                      disabled={submitting || permissionsReadOnly} onPress={() => onChangeStatus(false)}
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
            <Button onPress={close} disabled={submitting}>{readOnly ? "Đóng" : "Hủy"}</Button>
            {!readOnly && (
            <Button mode="contained" onPress={onSave} disabled={submitting} loading={submitting}>
              Lưu thay đổi
            </Button>
            )}
          </View>
        </SafeAreaView>
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
    backgroundColor: colors.white,
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
    paddingTop: spacing.xl,
    paddingBottom: 14,
    backgroundColor: garden.cream,
    borderBottomWidth: 1,
    borderBottomColor: garden.line,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
  },
  headerLeaf: {
    ...leafShape(42),
    backgroundColor: garden.moss,
    justifyContent: "center",
    alignItems: "center",
  },
  infoCard: {
    backgroundColor: garden.cream,
    borderRadius: radius.card,
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
    ...typography.caption, color: colors.textSecondary,
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
    paddingVertical: spacing.sm,
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
  rolePickerRow: {
    flexDirection: "row",
    gap: spacing.sm,
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
    color: colors.white,
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
    color: colors.white,
    fontWeight: "700",
  },
  modalFooter: {
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 18,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: garden.line,
    gap: 10,
  },

});
