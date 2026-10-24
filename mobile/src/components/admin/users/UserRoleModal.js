import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, typography } from "../../../theme/tokens";

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { Button } from "react-native-paper";
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
  const close = () => { if (!submitting) onClose(); };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView edges={["bottom", "left", "right"]} style={styles.modalCard}>
          {/* HEADER */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Phân quyền vai trò</Text>
              <Text style={styles.modalSubtitle} numberOfLines={1}>
                Tài khoản: {targetUser?.fullName}
              </Text>
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

          {/* BODY */}
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalBody}>
            {ROLE_OPTIONS.map((item) => {
              const isSelected = selectedRole === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.roleOptionCard,
                    isSelected && styles.roleOptionCardSelected,
                  ]}
                  disabled={submitting} onPress={() => onSelectRole(item.key)}
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
                    <View style={{ marginLeft: spacing.md, flexShrink: 1 }}>
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
          </ScrollView>

          {/* FOOTER */}
          <View style={styles.modalFooter}>
            <Button onPress={close} disabled={submitting}>Hủy</Button>
            <Button mode="contained" onPress={onConfirm} disabled={submitting} loading={submitting}>
              Lưu vai trò
            </Button>
          </View>
        </SafeAreaView>
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
    maxHeight: "90%",
    width: "100%",
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
    ...typography.caption, color: colors.textSecondary,
    marginTop: 2,
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
