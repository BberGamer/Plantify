import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, MapPin, PenLine, Phone, User } from "lucide-react";

function ProfilePersonalInformationCard({
  inputClass,
  isEditing,
  isLoading,
  onCancel,
  onChange,
  onSave,
  onStartEdit,
  profileForm,
}) {
  const fields = [
    { id: "fullName", label: "Họ và tên", icon: User, placeholder: "Nhập họ và tên" },
    { id: "email", label: "Email", icon: Mail, placeholder: "Nhập địa chỉ email", type: "email" },
    { id: "phone", label: "Số điện thoại", icon: Phone, placeholder: "Nhập số điện thoại" },
    { id: "address", label: "Địa chỉ", icon: MapPin, placeholder: "Nhập địa chỉ" },
  ];

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <CardHeader className="profile-card-header">
        <div className="profile-card-header-row">
          <div>
            <CardTitle className="text-xl text-slate-800">Thông tin cá nhân</CardTitle>
            <CardDescription className="mt-1.5 text-slate-500">
              Cập nhật thông tin tài khoản của bạn
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
              <Button
                onClick={onCancel}
                variant="outline"
                disabled={isLoading}
                className="border-slate-300"
              >
                Hủy
              </Button>
              <Button
                onClick={onSave}
                disabled={isLoading}
                className="gap-2 bg-green-600 text-white shadow-sm hover:bg-green-700"
              >
                {isLoading ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <div className="profile-form-grid">
        {fields.map(({ icon: Icon, id, label, placeholder, type }) => (
          <div key={id} className="profile-field">
            <Label htmlFor={id} className="profile-field-label">{label}</Label>
            <div className="profile-input-wrapper">
              <Icon className="profile-input-icon" />
              <Input
                id={id}
                type={type}
                value={profileForm[id]}
                onChange={(event) => onChange(id, event.target.value)}
                disabled={!isEditing}
                className={inputClass(isEditing)}
                placeholder={placeholder}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export { ProfilePersonalInformationCard };
