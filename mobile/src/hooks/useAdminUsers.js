import { useState, useEffect, useCallback } from "react";
import userService from "../services/userService";
import useAuthStore from "../../store/authStore";

export default function useAdminUsers() {
  const { user: currentAdmin } = useAuthStore();
  const currentAdminId = currentAdmin?._id || currentAdmin?.id;

  // Danh sach & phan trang
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

  // Filter & search
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Toast notification
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const showToast = useCallback((message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: "", type: "success" });
    }, 3500);
  }, []);

  // Modal Chi tiet & Cap nhat User
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("customer");
  const [editStatus, setEditStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal Doi Role
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [targetUserForRole, setTargetUserForRole] = useState(null);
  const [newRoleSelection, setNewRoleSelection] = useState("customer");

  // Modal Xac nhan Khoa / Kich hoat
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
    [search, selectedRole, selectedStatus, showToast]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [selectedRole, selectedStatus]);

  const handleSearchSubmit = () => {
    fetchUsers(1);
  };

  const handleSearchClear = () => {
    setSearch("");
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

      // Optimistic update
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

  // 3. Mo Modal Xac nhan Khoa / Kich hoat
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

      // Optimistic update
      setUsers((prev) =>
        prev.map((u) => (u._id === target._id ? { ...u, status: newStatus } : u))
      );

      const res = await userService.updateUserStatus(target._id, newStatus);
      showToast(res.message || (newStatus ? "Kích hoạt thành công!" : "Khóa tài khoản thành công!"));

      setConfirmModalVisible(false);
      setTargetUserForStatus(null);

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

  // 4. Mo Modal doi vai tro
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

  return {
    currentAdminId,
    users,
    pagination,
    loading,
    refreshing,
    search,
    setSearch,
    selectedRole,
    setSelectedRole,
    selectedStatus,
    setSelectedStatus,
    toast,
    fetchUsers,
    handleRefresh,
    handleSearchSubmit,
    handleSearchClear,
    // Detail modal
    detailModalVisible,
    setDetailModalVisible,
    selectedUser,
    editFullName,
    setEditFullName,
    editPhone,
    setEditPhone,
    editRole,
    setEditRole,
    editStatus,
    setEditStatus,
    submitting,
    handleOpenDetail,
    handleSaveUserInfo,
    // Status modal
    confirmModalVisible,
    setConfirmModalVisible,
    targetUserForStatus,
    statusLoading,
    handleOpenStatusConfirm,
    handleConfirmStatusChange,
    // Role modal
    roleModalVisible,
    setRoleModalVisible,
    targetUserForRole,
    newRoleSelection,
    setNewRoleSelection,
    handleOpenRoleModal,
    handleConfirmRoleChange,
  };
}
