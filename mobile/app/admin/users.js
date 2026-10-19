import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "../../src/theme/colors";
import userService from "../../src/services/userService";
import useAuthStore from "../../store/authStore";

const ROLES = [
  { key: "all", label: "Tất cả" },
  { key: "customer", label: "Customer" },
  { key: "manager", label: "Manager" },
  { key: "admin", label: "Admin" },
];

const STATUSES = [
  { key: "all", label: "Tất cả" },
  { key: "true", label: "Hoạt động" },
  { key: "false", label: "Đã khóa" },
];

export default function AdminUsersScreen() {
  const router = useRouter();
  const { user: currentAdmin } = useAuthStore();
  const currentAdminId = currentAdmin?._id || currentAdmin?.id;

  // State danh sach & phan trang
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    totalUsers: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // State filter & search
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // State Toast Notification (hoat dong tren ca Web va Mobile)
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: "", type: "success" });
    }, 3500);
  };

  // State Modal Chi tiet & Cap nhat User
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("customer");
  const [editStatus, setEditStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State Modal Doi Role
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [targetUserForRole, setTargetUserForRole] = useState(null);
  const [newRoleSelection, setNewRoleSelection] = useState("customer");

  // State Modal Xac nhan Khoa / Kich hoat (Thao tac truc tiep qua Modal, khong phu thuoc vao Alert cua Web)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [targetUserForStatus, setTargetUserForStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Goi API lay danh sach user
  const fetchUsers = useCallback(
    async (page = 1, isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const params = {
          page,
          limit: 10,
        };

        if (search.trim()) {
          params.search = search.trim();
        }
        if (selectedRole !== "all") {
          params.role = selectedRole;
        }
        if (selectedStatus !== "all") {
          params.status = selectedStatus;
        }

        const res = await userService.getUsers(params);
        if (res.success && res.data) {
          setUsers(res.data.users || []);
          if (res.data.pagination) {
            setPagination(res.data.pagination);
          }
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || err.message || "Không thể tải danh sách người dùng";
        showToast(errorMsg, "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, selectedRole, selectedStatus]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [selectedRole, selectedStatus]);

  const handleSearchSubmit = () => {
    fetchUsers(1);
  };

  const handleRefresh = () => {
    fetchUsers(pagination.currentPage, true);
  };

  // 1. Xem chi tiet user
  const handleOpenDetail = async (item) => {
    try {
      setLoading(true);
      const res = await userService.getUserById(item._id);
      const userData = res.data || item;
      setSelectedUser(userData);
      setEditFullName(userData.fullName || "");
      setEditPhone(userData.phone || "");
      setEditRole(userData.role || "customer");
      setEditStatus(userData.status !== undefined ? userData.status : true);
      setDetailModalVisible(true);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Không thể lấy thông tin chi tiết";
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  // 2. Cap nhat thong tin & trang thai user
  const handleSaveUserInfo = async () => {
    if (!selectedUser) return;
    if (!editFullName.trim()) {
      showToast("Họ và tên không được để trống.", "error");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        fullName: editFullName.trim(),
        phone: editPhone.trim(),
        role: editRole,
        status: editStatus,
      };

      const res = await userService.updateUser(selectedUser._id, payload);
      showToast(res.message || "Cập nhật thông tin thành công!");
      setDetailModalVisible(false);

      // Cap nhat state local
      setUsers((prev) =>
        prev.map((u) => (u._id === selectedUser._id ? { ...u, ...payload } : u))
      );
      fetchUsers(pagination.currentPage);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Cập nhật thông tin thất bại";
      showToast(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Mo Modal Xac nhan Khoa / Kich hoat tai khoan
  const handleOpenStatusConfirm = (target) => {
    const isCurrentlyActive = target.status !== false;

    // Chan admin tu khoa chinh minh
    if (target._id === currentAdminId && isCurrentlyActive) {
      showToast("Bạn không thể tự khóa tài khoản của chính mình!", "error");
      return;
    }

    setTargetUserForStatus(target);
    setConfirmModalVisible(true);
  };

  // Thuc thi Khoa / Kich hoat khi bam xac nhan trong Modal
  const handleConfirmStatusChange = async () => {
    if (!targetUserForStatus) return;

    const target = targetUserForStatus;
    const isCurrentlyActive = target.status !== false;
    const newStatus = !isCurrentlyActive;

    try {
      setStatusLoading(true);

      // Optimistic update UI ngay lap tuc de nguoi dung thay su thay doi
      setUsers((prev) =>
        prev.map((u) => (u._id === target._id ? { ...u, status: newStatus } : u))
      );

      const res = await userService.updateUserStatus(target._id, newStatus);
      showToast(res.message || (newStatus ? "Kích hoạt thành công!" : "Khóa tài khoản thành công!"));

      setConfirmModalVisible(false);
      setTargetUserForStatus(null);

      // Reload lai tu server de dong bo du lieu
      fetchUsers(pagination.currentPage);
    } catch (err) {
      // Rollback neu loi
      setUsers((prev) =>
        prev.map((u) => (u._id === target._id ? { ...u, status: isCurrentlyActive } : u))
      );
      const errorMsg =
        err.response?.data?.message || err.message || "Thao tác thất bại";
      showToast(errorMsg, "error");
    } finally {
      setStatusLoading(false);
    }
  };

  // 4. Mo Modal doi vai tro (Manage System Roles)
  const handleOpenRoleModal = (target) => {
    setTargetUserForRole(target);
    setNewRoleSelection(target.role || "customer");
    setRoleModalVisible(true);
  };

  const handleConfirmRoleChange = async () => {
    if (!targetUserForRole) return;

    if (targetUserForRole._id === currentAdminId && newRoleSelection !== "admin") {
      showToast("Bạn không thể tự hạ quyền vai trò admin của chính mình!", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await userService.updateUserRole(targetUserForRole._id, newRoleSelection);
      showToast(res.message || "Cập nhật vai trò thành công!");

      // Optimistic update
      setUsers((prev) =>
        prev.map((u) =>
          u._id === targetUserForRole._id ? { ...u, role: newRoleSelection } : u
        )
      );

      setRoleModalVisible(false);
      fetchUsers(pagination.currentPage);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Không thể cập nhật vai trò";
      showToast(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Render role badge voi mau sac dac trung
  const renderRoleBadge = (role) => {
    let bg = colors.softMintBg;
    let textColor = colors.primary;
    let label = "Customer";

    if (role === "admin") {
      bg = "#F6F4FC";
      textColor = "#7C3AED";
      label = "Admin";
    } else if (role === "manager") {
      bg = "#FFF8EE";
      textColor = "#C26D2B";
      label = "Manager";
    }

    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
      </View>
    );
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    const isActive = status !== false;
    return (
      <View
        style={[
          styles.badge,
          { backgroundColor: isActive ? "#EDF7F1" : "#FEE2E2" },
        ]}
      >
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isActive ? colors.statusSuccess : colors.statusError },
          ]}
        />
        <Text
          style={[
            styles.badgeText,
            { color: isActive ? "#15803D" : colors.statusError },
          ]}
        >
          {isActive ? "Hoạt động" : "Bị khóa"}
        </Text>
      </View>
    );
  };

  // Render tung User Card
  const renderUserItem = ({ item }) => {
    const initials = item.fullName
      ? item.fullName
          .split(" ")
          .map((n) => n[0])
          .slice(-2)
          .join("")
          .toUpperCase()
      : "PL";

    const isSelf = item._id === currentAdminId;
    const isActive = item.status !== false;

    return (
      <View style={styles.userCard}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => handleOpenDetail(item)}
          activeOpacity={0.7}
        >
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {item.fullName}
              </Text>
              {isSelf && (
                <View style={styles.selfTag}>
                  <Text style={styles.selfTagText}>Bạn</Text>
                </View>
              )}
            </View>
            <Text style={styles.userEmail} numberOfLines={1}>
              {item.email}
            </Text>
            {item.phone ? (
              <Text style={styles.userPhone}>
                <Ionicons name="call-outline" size={12} color={colors.textSecondary} /> {item.phone}
              </Text>
            ) : null}
          </View>

          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Tags Row */}
        <View style={styles.tagsRow}>
          {renderRoleBadge(item.role)}
          {renderStatusBadge(item.status)}
          {item.isGoogleAccount && (
            <View style={[styles.badge, { backgroundColor: "#EEF2FF" }]}>
              <Ionicons name="logo-google" size={11} color="#4F46E5" />
              <Text style={[styles.badgeText, { color: "#4F46E5", marginLeft: 3 }]}>Google</Text>
            </View>
          )}
        </View>

        {/* Actions Row */}
        <View style={styles.actionButtonsRow}>
          {/* Nut Xem & Sua */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnOutline]}
            onPress={() => handleOpenDetail(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={15} color={colors.primary} />
            <Text style={styles.btnOutlineText}>Chi tiết / Sửa</Text>
          </TouchableOpacity>

          {/* Nut Doi Vai Tro */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnOutline]}
            onPress={() => handleOpenRoleModal(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="shield-checkmark-outline" size={15} color="#7C3AED" />
            <Text style={[styles.btnOutlineText, { color: "#7C3AED" }]}>Đổi vai trò</Text>
          </TouchableOpacity>

          {/* Nut Khoa / Mo Khoa (Deactivate / Ban) */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              isActive ? styles.btnDanger : styles.btnSuccess,
            ]}
            onPress={() => handleOpenStatusConfirm(item)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? "lock-closed" : "lock-open"}
              size={14}
              color="#FFFFFF"
            />
            <Text style={styles.btnSolidText}>
              {isActive ? "Khóa" : "Kích hoạt"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* TOAST NOTIFICATION BANNER */}
      {toast.visible && (
        <View
          style={[
            styles.toastBanner,
            toast.type === "error" ? styles.toastError : styles.toastSuccess,
          ]}
        >
          <Ionicons
            name={toast.type === "error" ? "alert-circle" : "checkmark-circle"}
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Quản lý người dùng</Text>
          <Text style={styles.headerSubtitle}>
            Tổng cộng: {pagination.totalUsers} tài khoản
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          activeOpacity={0.7}
        >
          <Ionicons name="reload" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên, email, SĐT..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearch("");
                fetchUsers(1);
              }}
            >
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={handleSearchSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.searchBtnText}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {/* FILTER CHIPS: ROLE */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Vai trò:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r.key}
              style={[
                styles.chip,
                selectedRole === r.key && styles.chipActive,
              ]}
              onPress={() => setSelectedRole(r.key)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedRole === r.key && styles.chipTextActive,
                ]}
              >
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* FILTER CHIPS: STATUS */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Trạng thái:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[
                styles.chip,
                selectedStatus === s.key && styles.chipActive,
              ]}
              onPress={() => setSelectedStatus(s.key)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedStatus === s.key && styles.chipTextActive,
                ]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* USER LIST */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={54} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Không tìm thấy người dùng</Text>
              <Text style={styles.emptySub}>
                Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
              </Text>
            </View>
          }
          ListFooterComponent={
            pagination.totalPages > 1 ? (
              <View style={styles.paginationBar}>
                <TouchableOpacity
                  style={[
                    styles.pageBtn,
                    !pagination.hasPrevPage && styles.pageBtnDisabled,
                  ]}
                  disabled={!pagination.hasPrevPage}
                  onPress={() => fetchUsers(pagination.currentPage - 1)}
                >
                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color={pagination.hasPrevPage ? colors.primary : "#9CA3AF"}
                  />
                  <Text
                    style={[
                      styles.pageBtnText,
                      !pagination.hasPrevPage && styles.pageBtnTextDisabled,
                    ]}
                  >
                    Trước
                  </Text>
                </TouchableOpacity>

                <Text style={styles.pageInfoText}>
                  Trang {pagination.currentPage} / {pagination.totalPages}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.pageBtn,
                    !pagination.hasNextPage && styles.pageBtnDisabled,
                  ]}
                  disabled={!pagination.hasNextPage}
                  onPress={() => fetchUsers(pagination.currentPage + 1)}
                >
                  <Text
                    style={[
                      styles.pageBtnText,
                      !pagination.hasNextPage && styles.pageBtnTextDisabled,
                    ]}
                  >
                    Sau
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={pagination.hasNextPage ? colors.primary : "#9CA3AF"}
                  />
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}

      {/* MODAL 1: XEM CHI TIET & CAP NHAT THONG TIN */}
      <Modal
        visible={detailModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Chi tiết tài khoản</Text>
                <Text style={styles.modalSubtitle}>Xem & cập nhật thông tin</Text>
              </View>
              <TouchableOpacity
                onPress={() => setDetailModalVisible(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalBody}
            >
              {selectedUser ? (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Mã User (ID):</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {selectedUser._id}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email:</Text>
                    <Text style={styles.infoValueBold}>{selectedUser.email}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Ngày tạo:</Text>
                    <Text style={styles.infoValue}>
                      {new Date(selectedUser.createdAt).toLocaleString("vi-VN")}
                    </Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Họ và tên *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editFullName}
                      onChangeText={setEditFullName}
                      placeholder="Nhập họ và tên"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Số điện thoại</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editPhone}
                      onChangeText={setEditPhone}
                      placeholder="Nhập số điện thoại (10 chữ số)"
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Vai trò hệ thống</Text>
                    <View style={styles.rolePickerRow}>
                      {["customer", "manager", "admin"].map((r) => (
                        <TouchableOpacity
                          key={r}
                          style={[
                            styles.roleChoiceBtn,
                            editRole === r && styles.roleChoiceBtnActive,
                          ]}
                          onPress={() => setEditRole(r)}
                        >
                          <Text
                            style={[
                              styles.roleChoiceText,
                              editRole === r && styles.roleChoiceTextActive,
                            ]}
                          >
                            {r.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Trạng thái hoạt động</Text>
                    <View style={styles.rolePickerRow}>
                      <TouchableOpacity
                        style={[
                          styles.roleChoiceBtn,
                          editStatus === true && styles.statusChoiceActive,
                        ]}
                        onPress={() => setEditStatus(true)}
                      >
                        <Text
                          style={[
                            styles.roleChoiceText,
                            editStatus === true && { color: "#FFFFFF", fontWeight: "700" },
                          ]}
                        >
                          HOẠT ĐỘNG
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.roleChoiceBtn,
                          editStatus === false && styles.statusChoiceBanned,
                        ]}
                        onPress={() => setEditStatus(false)}
                      >
                        <Text
                          style={[
                            styles.roleChoiceText,
                            editStatus === false && { color: "#FFFFFF", fontWeight: "700" },
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

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDetailModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Đóng</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveUserInfo}
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

      {/* MODAL 2: DOI VAI TRO NHANH (MANAGE SYSTEM ROLES) */}
      <Modal
        visible={roleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: 420 }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Phân quyền vai trò</Text>
                <Text style={styles.modalSubtitle} numberOfLines={1}>
                  Tài khoản: {targetUserForRole?.fullName}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setRoleModalVisible(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {["customer", "manager", "admin"].map((r) => {
                const isSelected = newRoleSelection === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.roleOptionCard,
                      isSelected && styles.roleOptionCardSelected,
                    ]}
                    onPress={() => setNewRoleSelection(r)}
                  >
                    <View style={styles.roleOptionLeft}>
                      <Ionicons
                        name={
                          r === "admin"
                            ? "shield-checkmark"
                            : r === "manager"
                            ? "briefcase"
                            : "person"
                        }
                        size={20}
                        color={isSelected ? colors.primary : colors.textSecondary}
                      />
                      <View style={{ marginLeft: 12 }}>
                        <Text style={[styles.roleOptionTitle, isSelected && { color: colors.primary }]}>
                          {r.toUpperCase()}
                        </Text>
                        <Text style={styles.roleOptionSub}>
                          {r === "admin"
                            ? "Toàn quyền quản trị hệ thống"
                            : r === "manager"
                            ? "Quản lý nội dung & cây cảnh"
                            : "Khách hàng sử dụng app"}
                        </Text>
                      </View>
                    </View>

                    <Ionicons
                      name={isSelected ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={isSelected ? colors.primary : "#D1D5DB"}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setRoleModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleConfirmRoleChange}
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

      {/* MODAL 3: XAC NHAN KHOA / KICH HOAT (HOAT DONG 100% TREN CA WEB VA MOBILE) */}
      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: 380 }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={[
                    styles.confirmIconCircle,
                    targetUserForStatus?.status !== false
                      ? { backgroundColor: "#FEE2E2" }
                      : { backgroundColor: "#DCFCE7" },
                  ]}
                >
                  <Ionicons
                    name={
                      targetUserForStatus?.status !== false
                        ? "lock-closed"
                        : "lock-open"
                    }
                    size={20}
                    color={
                      targetUserForStatus?.status !== false
                        ? colors.statusError
                        : colors.statusSuccess
                    }
                  />
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.modalTitle}>
                    {targetUserForStatus?.status !== false
                      ? "Khóa tài khoản"
                      : "Kích hoạt tài khoản"}
                  </Text>
                  <Text style={styles.modalSubtitle}>Xác nhận thay đổi trạng thái</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setConfirmModalVisible(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.confirmPromptText}>
                Bạn có chắc chắn muốn{" "}
                <Text style={{ fontWeight: "700" }}>
                  {targetUserForStatus?.status !== false
                    ? "KHÓA (BAN)"
                    : "KÍCH HOẠT LẠI"}
                </Text>{" "}
                tài khoản:
              </Text>

              <View style={styles.confirmUserBox}>
                <Text style={styles.confirmUserName}>
                  {targetUserForStatus?.fullName}
                </Text>
                <Text style={styles.confirmUserEmail}>
                  {targetUserForStatus?.email}
                </Text>
              </View>

              <Text style={styles.confirmNoteText}>
                {targetUserForStatus?.status !== false
                  ? "⚠️ Sau khi bị khóa, tài khoản này sẽ bị từ chối truy cập và đăng nhập vào ứng dụng."
                  : "✅ Sau khi kích hoạt, tài khoản này có thể đăng nhập và sử dụng ứng dụng bình thường."}
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setConfirmModalVisible(false)}
                disabled={statusLoading}
              >
                <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  targetUserForStatus?.status !== false
                    ? { backgroundColor: colors.statusError }
                    : { backgroundColor: colors.statusSuccess },
                ]}
                onPress={handleConfirmStatusChange}
                disabled={statusLoading}
              >
                {statusLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {targetUserForStatus?.status !== false
                      ? "Xác nhận Khóa"
                      : "Xác nhận Kích hoạt"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAF9",
  },
  toastBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 9999,
  },
  toastSuccess: {
    backgroundColor: "#10B981",
  },
  toastError: {
    backgroundColor: "#EF4444",
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECE9",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.softMintBg,
    justifyContent: "center",
    alignItems: "center",
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 8,
    paddingVertical: 0,
  },
  searchBtn: {
    marginLeft: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  filterSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
  },
  filterTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    width: 70,
  },
  chipsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.textSecondary,
  },
  userCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8ECE9",
    shadowColor: "#183B2B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  selfTag: {
    marginLeft: 6,
    backgroundColor: colors.lightMint,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  selfTagText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: "700",
  },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 36,
    borderRadius: 8,
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  btnOutlineText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary,
    marginLeft: 4,
  },
  btnDanger: {
    backgroundColor: "#EF4444",
  },
  btnSuccess: {
    backgroundColor: "#10B981",
  },
  btnSolidText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  paginationBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 8,
  },
  pageBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pageBtnDisabled: {
    opacity: 0.5,
  },
  pageBtnText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
    marginHorizontal: 4,
  },
  pageBtnTextDisabled: {
    color: "#9CA3AF",
  },
  pageInfoText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECE9",
  },
  confirmIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
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
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
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
  confirmNoteText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
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
    height: 44,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: "#F9FAFB",
  },
  rolePickerRow: {
    flexDirection: "row",
    gap: 8,
  },
  roleChoiceBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  roleChoiceBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  statusChoiceBanned: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8ECE9",
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  cancelBtnText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  saveBtn: {
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
  },
  saveBtnText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  roleOptionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    marginBottom: 10,
  },
  roleOptionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.softMintBg,
  },
  roleOptionLeft: {
    flexDirection: "row",
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
});
