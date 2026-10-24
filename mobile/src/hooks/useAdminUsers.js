import getErrorMessage from "../utils/getErrorMessage";
// useAdminUsers.js - Quản lý danh sách, bộ lọc và thao tác tài khoản của Admin.
import { useState, useEffect, useCallback, useRef } from "react";
import userService from "../services/userService";
import useAuthStore from "../../store/authStore";

export default function useAdminUsers() {
  const currentAdmin = useAuthStore((state) => state.user);
  const currentAdminId = currentAdmin?._id || currentAdmin?.id;
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
  const [detailLoading, setDetailLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, updateSearch] = useState("");
  const [selectedRole, updateSelectedRole] = useState("all");
  const [selectedStatus, updateSelectedStatus] = useState("all");
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("customer");
  const [editStatus, setEditStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [targetUserForRole, setTargetUserForRole] = useState(null);
  const [newRoleSelection, setNewRoleSelection] = useState("customer");
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [targetUserForStatus, setTargetUserForStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const mounted = useRef(false);
  const listRequest = useRef(0);
  const detailRequest = useRef(0);
  const mutationPending = useRef(false);
  const toastTimer = useRef(null);
  const query = useRef({ search: "", role: "all", status: "all" });
  const pageRef = useRef(1);

  const showToast = useCallback((message, type = "success") => {
    if (!mounted.current) return;
    clearTimeout(toastTimer.current);
    setToast({ visible: true, message, type });
    toastTimer.current = setTimeout(() => {
      if (mounted.current)
        setToast({ visible: false, message: "", type: "success" });
    }, 3500);
  }, []);

  const fetchUsers = useCallback(
    async (page = 1, isRefresh = false) => {
      const requestId = ++listRequest.current;
      const isCurrent = () =>
        mounted.current && requestId === listRequest.current;
      pageRef.current = page;
      setLoading(!isRefresh);
      setRefreshing(isRefresh);
      const current = query.current;
      const params = { page, limit: 10 };
      if (current.search.trim()) params.search = current.search.trim();
      if (current.role !== "all") params.role = current.role;
      if (current.status !== "all") params.status = current.status;
      try {
        const response = await userService.getUsers(params);
        if (
          !response?.success ||
          !Array.isArray(response.data?.users) ||
          !response.data?.pagination
        ) {
          throw new Error(
            response?.message || "Dữ liệu người dùng không hợp lệ.",
          );
        }
        if (!isCurrent()) return;
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      } catch (error) {
        if (isCurrent())
          showToast(
            getErrorMessage(error, "Không tải được danh sách người dùng."),
            "error",
          );
      } finally {
        if (isCurrent()) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [showToast],
  );

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      ++listRequest.current;
      ++detailRequest.current;
      clearTimeout(toastTimer.current);
    };
  }, []);
  useEffect(() => {
    fetchUsers(1);
  }, [selectedRole, selectedStatus, fetchUsers]);

  const setSearch = (value) => {
    query.current.search = value;
    updateSearch(value);
  };
  const setSelectedRole = (value) => {
    query.current.role = value;
    updateSelectedRole(value);
  };
  const setSelectedStatus = (value) => {
    query.current.status = value;
    updateSelectedStatus(value);
  };
  const handleSearchSubmit = () => fetchUsers(1);
  const handleSearchClear = () => {
    setSearch("");
    return fetchUsers(1);
  };
  const handleRefresh = () => fetchUsers(pageRef.current, true);

  const handleOpenDetail = async (item) => {
    if (mutationPending.current) return;
    const requestId = ++detailRequest.current;
    const isCurrent = () =>
      mounted.current && requestId === detailRequest.current;
    setDetailLoading(true);
    try {
      const response = await userService.getUserById(item._id);
      if (!response?.success || !response.data?._id)
        throw new Error(
          response?.message || "Không lấy được thông tin tài khoản.",
        );
      if (!isCurrent()) return;
      const user = response.data;
      setSelectedUser(user);
      setEditFullName(user.fullName || "");
      setEditPhone(user.phone || "");
      setEditRole(user.role || "customer");
      setEditStatus(user.status !== false);
      setDetailModalVisible(true);
    } catch (error) {
      if (isCurrent())
        showToast(
          getErrorMessage(error, "Không lấy được thông tin tài khoản."),
          "error",
        );
    } finally {
      if (isCurrent()) setDetailLoading(false);
    }
  };

  const handleSaveUserInfo = async () => {
    if (mutationPending.current || !selectedUser || !detailModalVisible) return;
    if (!editFullName.trim()) {
      showToast("Họ và tên không được để trống.", "error");
      return;
    }
    mutationPending.current = true;
    setSubmitting(true);
    try {
      const payload = {
        fullName: editFullName.trim(),
        phone: editPhone.trim(),
        role: editRole,
        status: editStatus,
      };
      const response = await userService.updateUser(selectedUser._id, payload);
      if (!response?.success)
        throw new Error(response?.message || "Cập nhật thông tin thất bại.");
      if (!mounted.current) return;
      setUsers((previous) =>
        previous.map((user) =>
          user._id === selectedUser._id ? { ...user, ...payload } : user,
        ),
      );
      setDetailModalVisible(false);
      showToast(response.message || "Cập nhật thông tin thành công!");
      await fetchUsers(pageRef.current, true);
    } catch (error) {
      if (mounted.current)
        showToast(
          getErrorMessage(error, "Cập nhật thông tin thất bại."),
          "error",
        );
    } finally {
      mutationPending.current = false;
      if (mounted.current) setSubmitting(false);
    }
  };

  const handleOpenStatusConfirm = (target) => {
    if (mutationPending.current) return;
    if (target._id === currentAdminId && target.status !== false) {
      showToast("Bạn không thể tự khóa tài khoản của chính mình!", "error");
      return;
    }
    setTargetUserForStatus(target);
    setConfirmModalVisible(true);
  };
  const handleConfirmStatusChange = async () => {
    if (mutationPending.current || !targetUserForStatus || !confirmModalVisible)
      return;
    mutationPending.current = true;
    setStatusLoading(true);
    const target = targetUserForStatus;
    const status = target.status === false;
    try {
      const response = await userService.updateUserStatus(target._id, status);
      if (!response?.success)
        throw new Error(response?.message || "Thao tác thất bại.");
      if (!mounted.current) return;
      setUsers((previous) =>
        previous.map((user) =>
          user._id === target._id ? { ...user, status } : user,
        ),
      );
      setConfirmModalVisible(false);
      setTargetUserForStatus(null);
      showToast(response.message || "Cập nhật trạng thái thành công!");
      await fetchUsers(pageRef.current, true);
    } catch (error) {
      if (mounted.current)
        showToast(
          getErrorMessage(error, "Thao tác thất bại."),
          "error",
        );
    } finally {
      mutationPending.current = false;
      if (mounted.current) setStatusLoading(false);
    }
  };

  const handleOpenRoleModal = (target) => {
    if (mutationPending.current) return;
    setTargetUserForRole(target);
    setNewRoleSelection(target.role || "customer");
    setRoleModalVisible(true);
  };
  const handleConfirmRoleChange = async () => {
    if (mutationPending.current || !targetUserForRole || !roleModalVisible)
      return;
    if (
      targetUserForRole._id === currentAdminId &&
      newRoleSelection !== "admin"
    ) {
      showToast(
        "Bạn không thể tự hạ quyền vai trò quản trị viên của chính mình!",
        "error",
      );
      return;
    }
    mutationPending.current = true;
    setSubmitting(true);
    try {
      const response = await userService.updateUserRole(
        targetUserForRole._id,
        newRoleSelection,
      );
      if (!response?.success)
        throw new Error(response?.message || "Cập nhật vai trò thất bại.");
      if (!mounted.current) return;
      setUsers((previous) =>
        previous.map((user) =>
          user._id === targetUserForRole._id
            ? { ...user, role: newRoleSelection }
            : user,
        ),
      );
      setRoleModalVisible(false);
      showToast(response.message || "Cập nhật vai trò thành công!");
      await fetchUsers(pageRef.current, true);
    } catch (error) {
      if (mounted.current)
        showToast(
          getErrorMessage(error, "Cập nhật vai trò thất bại."),
          "error",
        );
    } finally {
      mutationPending.current = false;
      if (mounted.current) setSubmitting(false);
    }
  };

  return {
    currentAdminId,
    users,
    pagination,
    loading: loading || detailLoading,
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
    setDetailModalVisible: (value) => {
      if (!mutationPending.current) setDetailModalVisible(value);
    },
    selectedUser,
    editFullName,
    setEditFullName: (value) => {
      if (!mutationPending.current) setEditFullName(value);
    },
    editPhone,
    setEditPhone: (value) => {
      if (!mutationPending.current) setEditPhone(value);
    },
    editRole,
    setEditRole: (value) => {
      if (!mutationPending.current) setEditRole(value);
    },
    editStatus,
    setEditStatus: (value) => {
      if (!mutationPending.current) setEditStatus(value);
    },
    submitting,
    handleOpenDetail,
    handleSaveUserInfo,
    // Status modal
    confirmModalVisible,
    setConfirmModalVisible: (value) => {
      if (!mutationPending.current) setConfirmModalVisible(value);
    },
    targetUserForStatus,
    statusLoading,
    handleOpenStatusConfirm,
    handleConfirmStatusChange,
    // Role modal
    roleModalVisible,
    setRoleModalVisible: (value) => {
      if (!mutationPending.current) setRoleModalVisible(value);
    },
    targetUserForRole,
    newRoleSelection,
    setNewRoleSelection: (value) => {
      if (!mutationPending.current) setNewRoleSelection(value);
    },
    handleOpenRoleModal,
    handleConfirmRoleChange,
  };
}
