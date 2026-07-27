// ProfilePasswordCard.jsx - Hiển thị biểu mẫu đổi mật khẩu trong hồ sơ người dùng
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, PenLine, ShieldCheck } from "lucide-react";
import { ProfilePasswordInput } from "./ProfilePasswordInput";

function ProfilePasswordCard({
  isEditing,
  isLoading,
  onCancel,
  onChange,
  onSave,
  onStartEdit,
  passwordForm,
}) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <CardHeader className="profile-card-header">
        <div className="profile-card-header-row">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              Đổi mật khẩu
            </CardTitle>
            <CardDescription className="mt-1.5 text-slate-500">
              Cập nhật mật khẩu để bảo mật tài khoản
            </CardDescription>
          </div>
          {!isEditing ? (
            <Button
              onClick={onStartEdit}
              variant="outline"
              className="shrink-0 gap-2 border-slate-300 text-slate-700 transition-colors hover:bg-slate-100"
            >
              <PenLine className="h-4 w-4" />
              Chỉnh sửa
            </Button>
          ) : (
            <div className="flex shrink-0 gap-2">
              <Button onClick={onCancel} variant="outline" disabled={isLoading}>
                Hủy
              </Button>
              <Button
                onClick={onSave}
                disabled={isLoading}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                {isLoading ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <div className="px-6 py-8">
        {!isEditing ? (
          <div className="profile-password-grid-readonly">
            {["Mật khẩu hiện tại", "Mật khẩu mới", "Xác nhận mật khẩu mới"].map((label) => (
              <div key={label} className="profile-field">
                <Label className="profile-field-label">{label}</Label>
                <div className="profile-input-wrapper">
                  <Lock className="profile-input-icon" />
                  <Input
                    type="password"
                    value="••••••••"
                    disabled
                    className="profile-password-input"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            <PasswordField
              id="currentPassword"
              label="Mật khẩu hiện tại"
              placeholder="Nhập mật khẩu hiện tại"
              value={passwordForm.currentPassword}
              onChange={onChange}
            />
            <div className="profile-form-grid profile-form-grid-nopad">
              <PasswordField
                id="newPassword"
                label="Mật khẩu mới"
                placeholder="Tối thiểu 8 ký tự"
                value={passwordForm.newPassword}
                onChange={onChange}
              />
              <PasswordField
                id="confirmPassword"
                label="Xác nhận mật khẩu mới"
                placeholder="Nhập lại mật khẩu mới"
                value={passwordForm.confirmPassword}
                onChange={onChange}
              />
            </div>
            <p className="profile-password-hint">
              Mật khẩu mới phải có ít nhất <strong className="text-slate-700">8 ký tự</strong>,
              gồm <strong className="text-slate-700">chữ hoa</strong>,{" "}
              <strong className="text-slate-700">chữ thường</strong> và{" "}
              <strong className="text-slate-700">số</strong>.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

function PasswordField({ id, label, onChange, placeholder, value }) {
  return (
    <div className="profile-field">
      <Label htmlFor={id} className="profile-field-label">{label}</Label>
      <div className="profile-input-wrapper">
        <Lock className="profile-input-icon profile-input-icon-lifted" />
        <ProfilePasswordInput
          id={id}
          value={value}
          onChange={(event) => onChange(id, event.target.value)}
          placeholder={placeholder}
          className="h-12 rounded-lg border-green-200 pl-11 text-[15px] focus-visible:ring-green-500"
        />
      </div>
    </div>
  );
}

export { ProfilePasswordCard };
