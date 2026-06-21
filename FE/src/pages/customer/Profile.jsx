// Profile.jsx
// Trang hồ sơ người dùng: hiển thị thông tin thật từ DB, chức vụ, đổi mật khẩu theo cơ chế nút chỉnh sửa

import { useNavigate, Link } from "react-router";
import { useMyFavorites } from "@/features/favorites/hooks";
import { removeFavorite } from "@/features/favorites/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Package,
  Heart,
  Calendar,
  Leaf,
  Crown,
  Briefcase,
  PenLine,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useProfile } from "@/features/auth/hooks/useProfile";
import "@/styles/Profile.css";

// === Cấu hình hiển thị role theo DB ===
const ROLE_CONFIG = {
  customer: {
    label: "Khách hàng",
    icon: Leaf,
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  admin: {
    label: "Quản trị viên",
    icon: Crown,
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  "business manager": {
    label: "Quản lý kinh doanh",
    icon: Briefcase,
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  "content manager": {
    label: "Quản lý nội dung",
    icon: PenLine,
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
};



/** Lấy chữ cái đầu của tên để hiển thị Avatar fallback */
function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  return parts[parts.length - 1]?.charAt(0).toUpperCase() || "U";
}

/** Format ngày tham gia từ ISO string */
function formatJoinDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${year}`;
}

// === Component badge hiển thị role ===
function RoleBadge({ role }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.customer;
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`flex items-center gap-1.5 px-3 py-1 font-medium border ${config.className}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </Badge>
  );
}

// === Component PasswordInput với toggle hiện/ẩn ===
function PasswordInput({ id, value, onChange, disabled, placeholder, className }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`pr-10 ${className || ""}`}
      />
      {!disabled && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-600 transition-colors z-20"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

function Profile() {
  const navigate = useNavigate();
  const { favorites, loading: favLoading, refetch: refetchFavorites } = useMyFavorites();

  const handleUnfavorite = async (plantId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await removeFavorite(plantId);
      refetchFavorites();
    } catch {
      // bỏ qua lỗi
    }
  };

  const {
    user,
    isEditingProfile,
    isLoadingProfile,
    profileForm,
    setProfileForm,
    handleStartEditProfile,
    handleCancelEditProfile,
    handleSaveProfile,
    isEditingPassword,
    isLoadingPassword,
    passwordForm,
    setPasswordForm,
    handleStartEditPassword,
    handleCancelEditPassword,
    handleSavePassword,
  } = useProfile();

  // Class input tùy trạng thái chỉnh sửa
  const inputClass = (editing) =>
    editing
      ? "pl-11 h-12 text-[15px] rounded-lg border-green-200 focus-visible:ring-green-500 text-slate-800"
      : "pl-11 h-12 text-[15px] rounded-lg bg-slate-50 border-slate-200 text-slate-900 font-semibold disabled:opacity-100 shadow-sm";

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* === Tiêu đề trang === */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="profile-title">Tài khoản của tôi</h1>
        </motion.div>

        {/* === Profile Header Card === */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="profile-cover-card">
            {/* Ảnh bìa */}
            <div className="profile-cover-img-container">
              <img
                src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&auto=format&fit=crop&q=80"
                alt="Profile cover"
                className="profile-cover-img"
              />
              <div className="profile-cover-overlay-1" />
              <div className="profile-cover-overlay-2" />
            </div>

            <CardContent className="relative pt-0 pb-8">
              <div className="profile-user-info">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <Avatar className="w-32 h-32 md:w-36 md:h-36 border-4 border-white shadow-2xl ring-4 ring-green-50/50">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-green-600 to-emerald-500 text-white">
                      {getInitials(user?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Thông tin cơ bản */}
                <div className="flex-1 mt-4 md:mt-0 pb-2">
                  <h2 className="profile-name">{user?.fullName || "Người dùng"}</h2>
                  <p className="profile-email-row">
                    <Mail className="w-4 h-4 text-green-600" />
                    {user?.email || ""}
                  </p>
                  <div className="profile-badges">
                    <RoleBadge role={user?.role} />
                    <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 border-slate-200 text-slate-600 bg-slate-50 shadow-sm">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      Tham gia {formatJoinDate(user?.createdAt)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* === Tabs điều hướng === */}
        <Tabs defaultValue="profile" className="space-y-6">
          <div className={user?.role === "customer" ? "" : "profile-tabs-centered"}>
            <TabsList className={`grid p-1.5 bg-slate-100/80 rounded-xl ${user?.role === "customer" ? "w-full grid-cols-3 lg:w-auto" : "w-full max-w-[250px] grid-cols-1"}`}>
              <TabsTrigger value="profile" className="flex items-center justify-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all font-medium">
                <User className="w-4 h-4" />
                Thông tin
              </TabsTrigger>
              {user?.role === "customer" && (
                <>
                  <TabsTrigger value="orders" className="flex items-center justify-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all font-medium">
                    <Package className="w-4 h-4" />
                    Đơn hàng
                  </TabsTrigger>
                  <TabsTrigger value="saved" className="flex items-center justify-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all font-medium">
                    <Heart className="w-4 h-4" />
                    Cây yêu thích
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </div>

          {/* === Tab: Thông tin cá nhân === */}
          <TabsContent value="profile" className="space-y-8">

            {/* Thông tin cá nhân */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="profile-card-header">
                  <div className="profile-card-header-row">
                    <div>
                      <CardTitle className="text-xl text-slate-800">Thông tin cá nhân</CardTitle>
                      <CardDescription className="text-slate-500 mt-1.5">Cập nhật thông tin tài khoản của bạn</CardDescription>
                    </div>
                    {!isEditingProfile ? (
                      <Button onClick={handleStartEditProfile} variant="outline" className="gap-2 shrink-0 border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors">
                        <PenLine className="w-4 h-4" /> Chỉnh sửa
                      </Button>
                    ) : (
                      <div className="flex gap-2 shrink-0">
                        <Button onClick={handleCancelEditProfile} variant="outline" disabled={isLoadingProfile} className="border-slate-300">Hủy</Button>
                        <Button onClick={handleSaveProfile} disabled={isLoadingProfile} className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-sm">
                          {isLoadingProfile ? "Đang lưu..." : "Lưu"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <div className="profile-form-grid">
                  {/* Họ và tên */}
                  <div className="profile-field">
                    <Label htmlFor="fullName" className="profile-field-label">Họ và tên</Label>
                    <div className="profile-input-wrapper">
                      <User className="profile-input-icon" />
                      <Input id="fullName" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} disabled={!isEditingProfile} className={inputClass(isEditingProfile)} placeholder="Nhập họ và tên" />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="profile-field">
                    <Label htmlFor="email" className="profile-field-label">Email</Label>
                    <div className="profile-input-wrapper">
                      <Mail className="profile-input-icon" />
                      <Input id="email" type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} disabled={!isEditingProfile} className={inputClass(isEditingProfile)} placeholder="Nhập địa chỉ email" />
                    </div>
                  </div>

                  {/* Số điện thoại */}
                  <div className="profile-field">
                    <Label htmlFor="phone" className="profile-field-label">Số điện thoại</Label>
                    <div className="profile-input-wrapper">
                      <Phone className="profile-input-icon" />
                      <Input id="phone" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} disabled={!isEditingProfile} className={inputClass(isEditingProfile)} placeholder="Nhập số điện thoại" />
                    </div>
                  </div>

                  {/* Địa chỉ */}
                  <div className="profile-field">
                    <Label htmlFor="address" className="profile-field-label">Địa chỉ</Label>
                    <div className="profile-input-wrapper">
                      <MapPin className="profile-input-icon" />
                      <Input id="address" value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} disabled={!isEditingProfile} className={inputClass(isEditingProfile)} placeholder="Nhập địa chỉ" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Đổi mật khẩu */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="profile-card-header">
                  <div className="profile-card-header-row">
                    <div>
                      <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-green-600" />
                        Đổi mật khẩu
                      </CardTitle>
                      <CardDescription className="text-slate-500 mt-1.5">Cập nhật mật khẩu để bảo mật tài khoản</CardDescription>
                    </div>
                    {!isEditingPassword ? (
                      <Button onClick={handleStartEditPassword} variant="outline" className="gap-2 shrink-0 border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors">
                        <PenLine className="w-4 h-4" /> Chỉnh sửa
                      </Button>
                    ) : (
                      <div className="flex gap-2 shrink-0">
                        <Button onClick={handleCancelEditPassword} variant="outline" disabled={isLoadingPassword} className="border-slate-300">Hủy</Button>
                        <Button onClick={handleSavePassword} disabled={isLoadingPassword} className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-sm">
                          {isLoadingPassword ? "Đang lưu..." : "Lưu"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <div className="px-6 py-8">
                  {!isEditingPassword ? (
                    /* Trạng thái xem: hiển thị placeholder mờ */
                    <div className="space-y-6">
                      <div className="profile-password-grid-readonly">
                        {["Mật khẩu hiện tại", "Mật khẩu mới", "Xác nhận mật khẩu mới"].map((label) => (
                          <div key={label} className="profile-field">
                            <Label className="profile-field-label">{label}</Label>
                            <div className="profile-input-wrapper">
                              <Lock className="profile-input-icon" />
                              <Input type="password" value="••••••••" disabled className="pl-11 h-12 text-[15px] rounded-lg bg-slate-50 border-slate-200 text-slate-900 font-bold disabled:opacity-100 tracking-[0.3em] shadow-sm" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Trạng thái chỉnh sửa: form nhập thật */
                    <div className="space-y-8">
                      {/* Mật khẩu hiện tại */}
                      <div className="profile-field">
                        <Label htmlFor="currentPassword" className="profile-field-label">Mật khẩu hiện tại</Label>
                        <div className="profile-input-wrapper">
                          <Lock className="profile-input-icon" style={{ zIndex: 10 }} />
                          <PasswordInput id="currentPassword" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} placeholder="Nhập mật khẩu hiện tại" className="border-green-200 focus-visible:ring-green-500 pl-11 h-12 text-[15px] rounded-lg" />
                        </div>
                      </div>

                      {/* Mật khẩu mới + Xác nhận */}
                      <div className="profile-form-grid" style={{ padding: 0 }}>
                        <div className="profile-field">
                          <Label htmlFor="newPassword" className="profile-field-label">Mật khẩu mới</Label>
                          <div className="profile-input-wrapper">
                            <Lock className="profile-input-icon" style={{ zIndex: 10 }} />
                            <PasswordInput id="newPassword" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} placeholder="Tối thiểu 8 ký tự" className="border-green-200 focus-visible:ring-green-500 pl-11 h-12 text-[15px] rounded-lg" />
                          </div>
                        </div>

                        <div className="profile-field">
                          <Label htmlFor="confirmPassword" className="profile-field-label">Xác nhận mật khẩu mới</Label>
                          <div className="profile-input-wrapper">
                            <Lock className="profile-input-icon" style={{ zIndex: 10 }} />
                            <PasswordInput id="confirmPassword" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} placeholder="Nhập lại mật khẩu mới" className="border-green-200 focus-visible:ring-green-500 pl-11 h-12 text-[15px] rounded-lg" />
                          </div>
                        </div>
                      </div>

                      <p className="profile-password-hint">
                        Mật khẩu mới phải có ít nhất <strong className="text-slate-700">8 ký tự</strong>, gồm <strong className="text-slate-700">chữ hoa</strong>, <strong className="text-slate-700">chữ thường</strong> và <strong className="text-slate-700">số</strong>.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* === Tab: Đơn hàng (chỉ customer) === */}
          {user?.role === "customer" && (
            <TabsContent value="orders" className="space-y-4">
              <EmptyState
                icon={Package}
                title="Chưa có đơn hàng"
                description="Bạn chưa có đơn hàng nào. Hãy khám phá sản phẩm của chúng tôi!"
                action={{ label: "Khám phá sản phẩm", onClick: () => navigate("/marketplace") }}
              />
            </TabsContent>
          )}

          {/* === Tab: Cây yêu thích (chỉ customer) === */}
          {user?.role === "customer" && (
            <TabsContent value="saved" className="space-y-4">
              {favLoading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
                </div>
              ) : favorites.length === 0 ? (
                <EmptyState
                  icon={Heart}
                  title="Chưa có cây yêu thích"
                  description="Bạn chưa lưu cây nào. Khám phá và lưu những cây cảnh yêu thích của bạn!"
                  action={{ label: "Khám phá cây cảnh", onClick: () => navigate("/browse") }}
                />
              ) : (
                <div className="profile-plants-grid">
                  {favorites.map((fav, index) => {
                    const plant = fav.plantId;
                    if (!plant) return null;
                    const plantId = plant._id || plant.id;
                    const imageUrl = plant.thumbnail || plant.images?.[0] || "";
                    const savedDate = fav.createdAt
                      ? new Date(fav.createdAt).toLocaleDateString("vi-VN")
                      : "";
                    return (
                      <motion.div key={fav._id || plantId} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                          <div className="aspect-square overflow-hidden relative">
                            <img
                              src={imageUrl}
                              alt={plant.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            {/* Nút bỏ thích */}
                            <div className="absolute top-3 right-3">
                              <button
                                onClick={(e) => handleUnfavorite(plantId, e)}
                                className="profile-plant-heart-btn"
                                aria-label="Bỏ yêu thích"
                              >
                                <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                              </button>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold mb-1">{plant.name}</h3>
                            {plant.scientificName && (
                              <p className="text-xs text-muted-foreground italic mb-1">{plant.scientificName}</p>
                            )}
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Đã lưu: {savedDate}
                            </p>
                            <Button className="w-full mt-4" variant="outline" asChild>
                              <Link to={`/plant/${plantId}`}>Xem chi tiết</Link>
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

export { Profile };
