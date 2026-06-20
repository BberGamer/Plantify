// AdminUsers.jsx
// Giao diện quản lý người dùng cho khu vực quản trị

import { useState } from "react";
import { useAdminUsers } from "@/features/auth/hooks";
import { toast } from "sonner";
import { AdminUsersCreateDialog } from "../../features/auth/components/AdminUsersCreateDialog";
import { AdminUsersDeleteDialog } from "../../features/auth/components/AdminUsersDeleteDialog";
import { AdminUsersFilters } from "../../features/auth/components/AdminUsersFilters";
import { AdminUsersHeader } from "../../features/auth/components/AdminUsersHeader";
import { AdminUsersTable } from "../../features/auth/components/AdminUsersTable";
import { initialCreateUserForm } from "../../features/auth/hooks/adminUsers.utils";
import "@/styles/AdminUsers.css";

function AdminUsers() {
  const { users, loading, error, createUser, updateUserStatus, deleteUser } = useAdminUsers();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createUserForm, setCreateUserForm] = useState(initialCreateUserForm);
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdatingUserId, setStatusUpdatingUserId] = useState("");
  const [deleteTargetUser, setDeleteTargetUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredUsers = users.filter((user) => {
    const matchesSearch = !normalizedSearchTerm || (user.fullName || "").toLowerCase().includes(normalizedSearchTerm);
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const resetCreateUserForm = () => {
    setCreateUserForm(initialCreateUserForm);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleCreateDialogChange = (open) => {
    setIsCreateDialogOpen(open);

    if (!open) {
      resetCreateUserForm();
    }
  };

  const handleCreateUserFormChange = (event) => {
    const { name, value } = event.target;

    setCreateUserForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleCreateUserSubmit = async (event) => {
    event.preventDefault();

    const { fullName, email, phone, address, password, confirmPassword, role } = createUserForm;
    const normalizedFullName = fullName.trim();
    const normalizedEmail = email.trim();
    const normalizedPhone = phone.trim();
    const normalizedAddress = address.trim();

    if (!normalizedFullName || !normalizedEmail || !password || !role) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }

    const fullNameRegex = /^[\p{L}\s]+$/u;
    if (!fullNameRegex.test(normalizedFullName)) {
      toast.error("Họ tên chỉ được chứa chữ cái và khoảng trắng");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      toast.error("Email không đúng định dạng");
      return;
    }

    if (normalizedPhone !== "") {
      const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
      if (!phoneRegex.test(normalizedPhone)) {
        toast.error("Số điện thoại không hợp lệ (phải bắt đầu bằng 03, 05, 07, 08, 09 và gồm 10 chữ số)");
        return;
      }
    }

    if (password.length < 8) {
      toast.error("Mật khẩu phải chứa tối thiểu 8 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không trùng khớp");
      return;
    }

    setSubmitting(true);

    try {
      await createUser({
        fullName: normalizedFullName,
        email: normalizedEmail,
        phone: normalizedPhone,
        address: normalizedAddress,
        password,
        role,
      });
      toast.success("Tạo tài khoản người dùng thành công");
      resetCreateUserForm();
      setIsCreateDialogOpen(false);
    } catch (submitError) {
      const errorMessage = submitError.response?.data?.message || submitError.message || "Không thể tạo tài khoản người dùng";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (user) => {
    const nextStatus = !user.status;
    setStatusUpdatingUserId(user._id);

    try {
      await updateUserStatus(user._id, nextStatus);
      toast.success(
        nextStatus
          ? "Kích hoạt tài khoản thành công"
          : "Tạm khóa tài khoản thành công"
      );
    } catch (statusError) {
      const errorMessage = statusError.response?.data?.message || statusError.message || "Không thể cập nhật trạng thái người dùng";
      toast.error(errorMessage);
    } finally {
      setStatusUpdatingUserId("");
    }
  };

  const handleDeleteClick = (user) => {
    setDeleteTargetUser(user);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetUser) {
      return;
    }

    setDeleting(true);

    try {
      await deleteUser(deleteTargetUser._id);
      toast.success("Xóa người dùng thành công");
      setDeleteTargetUser(null);
    } catch (deleteError) {
      const errorMessage = deleteError.response?.data?.message || deleteError.message || "Không thể xóa người dùng";
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="admin-users-page">
        <div className="admin-users-bg-layer admin-users-bg-layer--base" />
        <div className="admin-users-bg-layer admin-users-bg-layer--left" />
        <div className="admin-users-bg-layer admin-users-bg-layer--right" />
        <div className="admin-users-bg-layer admin-users-bg-layer--pattern" />

        <div className="admin-users-content">
          <AdminUsersHeader onCreateClick={() => setIsCreateDialogOpen(true)} />

          <AdminUsersFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
          />

          <AdminUsersTable
            filteredUsers={filteredUsers}
            loading={loading}
            error={error}
            statusUpdatingUserId={statusUpdatingUserId}
            deleting={deleting}
            deleteTargetUser={deleteTargetUser}
            onStatusChange={handleStatusChange}
            onDeleteClick={handleDeleteClick}
          />
        </div>
      </div>

      <AdminUsersCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCreateDialogChange}
        onSubmit={handleCreateUserSubmit}
        createUserForm={createUserForm}
        onFormChange={handleCreateUserFormChange}
        onRoleChange={(value) => setCreateUserForm((previousForm) => ({ ...previousForm, role: value }))}
        submitting={submitting}
        showPassword={showPassword}
        onToggleShowPassword={() => setShowPassword((currentValue) => !currentValue)}
        showConfirmPassword={showConfirmPassword}
        onToggleShowConfirmPassword={() => setShowConfirmPassword((currentValue) => !currentValue)}
      />

      <AdminUsersDeleteDialog
        deleteTargetUser={deleteTargetUser}
        deleting={deleting}
        onOpenChange={(open) => !open && !deleting && setDeleteTargetUser(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

export { AdminUsers };
