





import { AdminUsersCreateDialogView } from "@/features/auth/components/admin-users-create/AdminUsersCreateDialogView";

function AdminUsersCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  createUserForm,
  onFormChange,
  onRoleChange,
  submitting,
  showPassword,
  onToggleShowPassword,
  showConfirmPassword,
  onToggleShowConfirmPassword
}) {
  return (
    <AdminUsersCreateDialogView
      createUserForm={createUserForm}
      onFormChange={onFormChange}
      onOpenChange={onOpenChange}
      onRoleChange={onRoleChange}
      onSubmit={onSubmit}
      onToggleShowConfirmPassword={onToggleShowConfirmPassword}
      onToggleShowPassword={onToggleShowPassword}
      open={open}
      showConfirmPassword={showConfirmPassword}
      showPassword={showPassword}
      submitting={submitting}
    />
  );
}

export { AdminUsersCreateDialog };
