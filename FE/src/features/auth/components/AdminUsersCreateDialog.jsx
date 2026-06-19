import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
  UserPlus
} from "lucide-react";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm người dùng mới</DialogTitle>
          <DialogDescription>
            Tạo nhanh tài khoản người dùng với các vai trò phù hợp trong hệ thống.
          </DialogDescription>
        </DialogHeader>

        <form className="admin-users-dialog-form" onSubmit={onSubmit}>
          <div className="admin-users-dialog-grid">
            <div className="admin-users-dialog-field">
              <Label htmlFor="admin-fullName">
                Họ và tên <span className="text-red-500">*</span>
              </Label>
              <div className="admin-users-input-wrapper">
                <User className="admin-users-input-icon" />
                <Input
                  id="admin-fullName"
                  name="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={createUserForm.fullName}
                  onChange={onFormChange}
                  className="pl-10"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="admin-users-dialog-field">
              <Label htmlFor="admin-email">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="admin-users-input-wrapper">
                <Mail className="admin-users-input-icon" />
                <Input
                  id="admin-email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={createUserForm.email}
                  onChange={onFormChange}
                  className="pl-10"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="admin-users-dialog-field">
              <Label htmlFor="admin-phone">Số điện thoại</Label>
              <div className="admin-users-input-wrapper">
                <Phone className="admin-users-input-icon" />
                <Input
                  id="admin-phone"
                  name="phone"
                  type="tel"
                  placeholder="0xxx xxx xxx"
                  value={createUserForm.phone}
                  onChange={onFormChange}
                  className="pl-10"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="admin-users-dialog-field">
              <Label htmlFor="admin-role">
                Vai trò <span className="text-red-500">*</span>
              </Label>
              <Select
                value={createUserForm.role}
                onValueChange={onRoleChange}
                disabled={submitting}
              >
                <SelectTrigger id="admin-role">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="business manager">Business Manager</SelectItem>
                  <SelectItem value="content manager">Content Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="admin-users-dialog-field">
            <Label htmlFor="admin-address">Địa chỉ nhà</Label>
            <div className="admin-users-input-wrapper">
              <MapPin className="admin-users-input-icon" />
              <Input
                id="admin-address"
                name="address"
                type="text"
                placeholder="123 Đường ABC, Quận X, TP.HCM"
                value={createUserForm.address}
                onChange={onFormChange}
                className="pl-10"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="admin-users-dialog-grid">
            <div className="admin-users-dialog-field">
              <Label htmlFor="admin-password">
                Mật khẩu <span className="text-red-500">*</span>
              </Label>
              <div className="admin-users-input-wrapper">
                <Lock className="admin-users-input-icon" />
                <Input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={createUserForm.password}
                  onChange={onFormChange}
                  className="pl-10 pr-10"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={onToggleShowPassword}
                  className="admin-users-password-toggle"
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Tối thiểu 8 ký tự</p>
            </div>

            <div className="admin-users-dialog-field">
              <Label htmlFor="admin-confirmPassword">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </Label>
              <div className="admin-users-input-wrapper">
                <Lock className="admin-users-input-icon" />
                <Input
                  id="admin-confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={createUserForm.confirmPassword}
                  onChange={onFormChange}
                  className="pl-10 pr-10"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={onToggleShowConfirmPassword}
                  className="admin-users-password-toggle"
                  tabIndex="-1"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-green-600" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Tạo người dùng
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { AdminUsersCreateDialog };
