import getErrorMessage from "../utils/getErrorMessage";
// useAdminUsers.js - Quản lý danh sách, bộ lọc và thao tác tài khoản của Admin.
import { useState, useEffect, useCallback, useRef } from "react";
import userService from "../services/userService";
import usePaginatedList from "./usePaginatedList";
import useAuthStore from "../../store/authStore";
import useDebouncedValue from "./useDebouncedValue";
import useScreenScope from "./useScreenScope";

export default function useAdminUsers() {
  const currentAdmin = useAuthStore((state) => state.user);
  const sessionVersion = useAuthStore((state) => state.sessionVersion);
  const currentAdminId = currentAdmin?._id || currentAdmin?.id;
  const [detailLoading, setDetailLoading] = useState(false);
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
  const detailRequest = useRef(0);
  const mutationPending = useRef(false);
  const toastTimer = useRef(null);
  const debounced = useDebouncedValue(search.trim());
  const { capture, isActive } = useScreenScope(undefined, () => {
    ++detailRequest.current;
    clearTimeout(toastTimer.current);
    setToast({ visible: false, message: "", type: "success" });
    setDetailLoading(false);
  });

  const fetchPage = useCallback(
    (params) => userService.getUsers({
      ...params,
      search: debounced.value,
      role: selectedRole,
      status: selectedStatus,
    }),
    [debounced.value, selectedRole, selectedStatus],
  );
  const userList = usePaginatedList(fetchPage, { limit: 10, enabled: !debounced.pending });
  const {
    items: users,
    setItems: setUsers,
    pagination,
    loading,
    refreshing,
  } = userList;
  const fetchUsers = useCallback((page, refresh = false) => {
    return userList.load(page, refresh);
  }, [userList.load]);

  const showToast = useCallback((message, type = "success") => {
    if (!isActive()) return;
    const inScope = capture();
    clearTimeout(toastTimer.current);
    setToast({ visible: true, message, type });
    toastTimer.current = setTimeout(() => {
      if (inScope())
        setToast({ visible: false, message: "", type: "success" });
    }, 3500);
  }, [capture, isActive]);

  useEffect(() => {
    if (userList.error) showToast(userList.error, "error");
  }, [userList.error, showToast]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      ++detailRequest.current;
      clearTimeout(toastTimer.current);
    };
  }, []);
  useEffect(() => {
    ++detailRequest.current;
    setDetailLoading(false);
    setDetailModalVisible(false);
    setRoleModalVisible(false);
    setConfirmModalVisible(false);
    setSelectedUser(null);
    setTargetUserForRole(null);
    setTargetUserForStatus(null);
    setEditFullName("");
    setEditPhone("");
    setToast({ visible: false, message: "", type: "success" });
  }, [sessionVersion]);
  const changeSearch = (value) => {
    userList.invalidate();
    updateSearch(value);
    if (value.trim() === debounced.value && !debounced.pending) fetchUsers(1);
  };
  const selectRole = (value) => {
    if (value === selectedRole && !debounced.pending) return;
    userList.invalidate();
    debounced.flush();
    updateSelectedRole(value);
  };
  const selectStatus = (value) => {
    if (value === selectedStatus && !debounced.pending) return;
    userList.invalidate();
    debounced.flush();
    updateSelectedStatus(value);
  };
  const handleSearchSubmit = () => {
    debounced.flush();
    if (!debounced.pending) return fetchUsers(1);
  };
  const handleSearchClear = () => {
    changeSearch("");
    debounced.flush("");
  };
  const handleRefresh = () => fetchUsers(undefined, true);

  const handleOpenDetail = async (item) => {
    if (mutationPending.current || !isActive()) return;
    closeDetail();
    closeRole();
    closeStatus();
    const inScope = capture();
    const requestId = ++detailRequest.current;
    const isCurrent = () =>
      inScope() && requestId === detailRequest.current;
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
    if (mutationPending.current || !selectedUser || !detailModalVisible || !isActive()) return;
    if (selectedUser.role === "admin" && (
      selectedUser._id !== currentAdminId ||
      editRole !== selectedUser.role ||
      editStatus !== (selectedUser.status !== false)
    )) {
      showToast("Tài khoản cùng vai trò chỉ được xem, không được chỉnh sửa.", "error");
      return;
    }
    const isCurrent = capture();
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
        ...(editRole !== selectedUser.role ? { role: editRole } : {}),
        ...(editStatus !== (selectedUser.status !== false) ? { status: editStatus } : {}),
      };
      const response = await userService.updateUser(selectedUser._id, payload);
      if (!response?.success)
        throw new Error(response?.message || "Cập nhật thông tin thất bại.");
      if (!isCurrent()) return;
      setUsers((previous) =>
        previous.map((user) =>
          user._id === selectedUser._id ? { ...user, ...payload } : user,
        ),
      );
      setDetailModalVisible(false);
      showToast(response.message || "Cập nhật thông tin thành công!");
      await userList.refresh();
    } catch (error) {
      if (isCurrent())
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
    if (mutationPending.current || !isActive()) return;
    if (target.role === "admin") {
      showToast("Tài khoản cùng vai trò chỉ được xem, không được chỉnh sửa.", "error");
      return;
    }
    if (target._id === currentAdminId && target.status !== false) {
      showToast("Bạn không thể tự khóa tài khoản của chính mình!", "error");
      return;
    }
    closeDetail();
    closeRole();
    setTargetUserForStatus(target);
    setConfirmModalVisible(true);
  };
  const handleConfirmStatusChange = async () => {
    if (mutationPending.current || !targetUserForStatus || !confirmModalVisible || !isActive())
      return;
    if (targetUserForStatus.role === "admin") {
      showToast("Tài khoản cùng vai trò chỉ được xem, không được chỉnh sửa.", "error");
      return;
    }
    const isCurrent = capture();
    mutationPending.current = true;
    setStatusLoading(true);
    const target = targetUserForStatus;
    const status = target.status === false;
    try {
      const response = await userService.updateUserStatus(target._id, status);
      if (!response?.success)
        throw new Error(response?.message || "Thao tác thất bại.");
      if (!isCurrent()) return;
      setUsers((previous) =>
        previous.map((user) =>
          user._id === target._id ? { ...user, status } : user,
        ),
      );
      setConfirmModalVisible(false);
      setTargetUserForStatus(null);
      showToast(response.message || "Cập nhật trạng thái thành công!");
      await userList.refresh();
    } catch (error) {
      if (isCurrent())
        showToast(getErrorMessage(error, "Thao tác thất bại."), "error");
    } finally {
      mutationPending.current = false;
      if (mounted.current) setStatusLoading(false);
    }
  };

  const handleOpenRoleModal = (target) => {
    if (mutationPending.current || !isActive()) return;
    if (target.role === "admin") {
      showToast("Không thể thay đổi vai trò quản trị viên.", "error");
      return;
    }
    closeDetail();
    closeStatus();
    setTargetUserForRole(target);
    setNewRoleSelection(target.role || "customer");
    setRoleModalVisible(true);
  };
  const handleConfirmRoleChange = async () => {
    if (mutationPending.current || !targetUserForRole || !roleModalVisible || !isActive())
      return;
    const isCurrent = capture();
    if (
      targetUserForRole.role === "admin" &&
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
      if (!isCurrent()) return;
      setUsers((previous) =>
        previous.map((user) =>
          user._id === targetUserForRole._id
            ? { ...user, role: newRoleSelection }
            : user,
        ),
      );
      setRoleModalVisible(false);
      showToast(response.message || "Cập nhật vai trò thành công!");
      await userList.refresh();
    } catch (error) {
      if (isCurrent())
        showToast(
          getErrorMessage(error, "Cập nhật vai trò thất bại."),
          "error",
        );
    } finally {
      mutationPending.current = false;
      if (mounted.current) setSubmitting(false);
    }
  };

  const closeDetail = () => {
    if (mutationPending.current) return;
    ++detailRequest.current;
    setDetailLoading(false);
    setDetailModalVisible(false);
    setSelectedUser(null);
    setEditFullName("");
    setEditPhone("");
  };
  const closeRole = () => {
    if (mutationPending.current) return;
    setRoleModalVisible(false);
    setTargetUserForRole(null);
  };
  const closeStatus = () => {
    if (mutationPending.current) return;
    setConfirmModalVisible(false);
    setTargetUserForStatus(null);
  };
  const changeField = (key, value) => {
    if (mutationPending.current || !detailModalVisible) return;
    if (selectedUser?.role === "admin" && (
      selectedUser._id !== currentAdminId || !["fullName", "phone"].includes(key)
    )) return;
    const actions = { fullName: setEditFullName, phone: setEditPhone, role: setEditRole, status: setEditStatus };
    if (Object.prototype.hasOwnProperty.call(actions, key)) actions[key](value);
  };
  const selectNewRole = (value) => {
    if (!mutationPending.current && roleModalVisible) setNewRoleSelection(value);
  };

  return {
    handleUserCreated: (user) => {
      if (!isActive()) return;
      const query = search.trim().toLowerCase();
      const excluded = (selectedRole !== "all" && selectedRole !== user.role) ||
        (selectedStatus !== "all" && selectedStatus !== String(user.status)) ||
        (query && ![user.fullName, user.email, user.phone].some((value) =>
          (value || "").toLowerCase().includes(query)));
      showToast(excluded
        ? "Đã thêm người dùng. Tài khoản mới không thuộc bộ lọc hiện tại."
        : "Thêm người dùng thành công.");
      fetchUsers(1);
    },
    currentAdminId,
    users,
    pagination,
    loading: loading || detailLoading,
    refreshing,
    listError: userList.error,
    search,
    changeSearch,
    selectedRole,
    selectRole,
    selectedStatus,
    selectStatus,
    toast,
    fetchUsers,
    handleRefresh,
    handleSearchSubmit,
    handleSearchClear,
    // Detail modal
    detailModalVisible,
    closeDetail,
    changeField,
    selectedUser,
    editFullName,
    editPhone,
    editRole,
    editStatus,
    submitting,
    handleOpenDetail,
    handleSaveUserInfo,
    // Status modal
    confirmModalVisible,
    closeStatus,
    targetUserForStatus,
    statusLoading,
    handleOpenStatusConfirm,
    handleConfirmStatusChange,
    // Role modal
    roleModalVisible,
    closeRole,
    targetUserForRole,
    newRoleSelection,
    selectNewRole,
    handleOpenRoleModal,
    handleConfirmRoleChange,
  };
}
