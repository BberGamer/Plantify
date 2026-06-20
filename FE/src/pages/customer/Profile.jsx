// Profile.jsx
// Trang hồ sơ người dùng: hiển thị thông tin thật từ DB, chức vụ, đổi mật khẩu theo cơ chế nút chỉnh sửa

import { useNavigate } from "react-router";
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

// === Dữ liệu mock đơn hàng và cây yêu thích (chờ API thật) ===
const mockOrders = [
  { id: "ORD-001", date: "2026-05-15", status: "Đã giao", total: "450,000đ", items: 2 },
  { id: "ORD-002", date: "2026-05-10", status: "Đang vận chuyển", total: "280,000đ", items: 1 },
  { id: "ORD-003", date: "2026-05-05", status: "Đã giao", total: "650,000đ", items: 3 },
];

const mockSavedPlants = [
  { id: 1, name: "Monstera Deliciosa", image: "https://images.unsplash.com/photo-1614887410788-e158d6efb3be?w=400", savedDate: "2026-05-12" },
  { id: 2, name: "Sen Đá", image: "https://images.unsplash.com/photo-1614425467998-8a7249179a53?w=400", savedDate: "2026-05-08" },
  { id: 3, name: "Kim Tiền", image: "https://images.unsplash.com/photo-1611383856597-aae8f0cfd9e6?w=400", savedDate: "2026-05-01" },
];

/**
 * Lấy chữ cái đầu của tên để hiển thị Avatar fallback
 * @param {string} name - Họ và tên
 * @returns {string} Chữ cái đầu
 */
function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  return parts[parts.length - 1]?.charAt(0).toUpperCase() || "U";
}

/**
 * Format ngày tham gia từ ISO string
 * @param {string} dateStr - Chuỗi ISO date từ DB
 * @returns {string} Ngày định dạng MM/YYYY
 */
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
        className={`pr-10 ${className || ''}`}
      />
      {!disabled && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-600 transition-colors z-20"
        >
          {show ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
        </button>
      )}
    </div>
  );
}

function Profile() {
  const navigate = useNavigate();

  const {
    user,
    // Profile
    isEditingProfile,
    isLoadingProfile,
    profileForm,
    setProfileForm,
    handleStartEditProfile,
    handleCancelEditProfile,
    handleSaveProfile,
    // Password
    isEditingPassword,
    isLoadingPassword,
    passwordForm,
    setPasswordForm,
    handleStartEditPassword,
    handleCancelEditPassword,
    handleSavePassword,
  } = useProfile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* === Tiêu đề trang === */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-slate-800 tracking-tight">Tài khoản của tôi</h1>
        </motion.div>

        {/* === Profile Header Card với ảnh bìa đẹp === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8 overflow-hidden border-2 border-green-100 shadow-md">
            {/* Ảnh bìa — thiên nhiên/cây cảnh kèm gradient overlay (đã tăng chiều cao lên ~1.3 lần) */}
            <div className="relative h-[230px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&auto=format&fit=crop&q=80"
                alt="Profile cover"
                className="w-full h-full object-cover object-center"
              />
              {/* Gradient overlay tạo chiều sâu */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-900/70 via-green-800/50 to-emerald-600/40" />
              {/* Overlay viền dưới mờ dần */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/60 to-transparent" />
            </div>

            <CardContent className="relative pt-0 pb-8">
              {/* Đã giảm margin âm để đẩy khối thông tin xuống dưới, bớt sát vào ảnh xanh */}
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-10 md:ml-4">

                {/* Avatar */}
                <div className="relative group flex-shrink-0">
                  <Avatar className="w-32 h-32 md:w-36 md:h-36 border-4 border-white shadow-2xl ring-4 ring-green-50/50">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-green-600 to-emerald-500 text-white shadow-inner">
                      {getInitials(user?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Thông tin cơ bản */}
                <div className="flex-1 mt-4 md:mt-0 pb-2">
                  <h2 className="text-3xl font-extrabold mb-2 text-slate-800 drop-shadow-sm">{user?.fullName || "Người dùng"}</h2>
                  <p className="text-slate-600 flex items-center gap-2 mb-4 text-base font-medium">
                    <Mail className="w-4 h-4 text-green-600" />
                    {user?.email || ""}
                  </p>

                  {/* Badges: Role + Ngày tham gia */}
                  <div className="flex flex-wrap gap-3">
                    {/* Badge chức vụ */}
                    <RoleBadge role={user?.role} />

                    {/* Badge ngày tham gia */}
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
          <TabsList className="grid w-full grid-cols-3 lg:w-auto p-1.5 bg-slate-100/80 rounded-xl">
            <TabsTrigger value="profile" className="flex items-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all font-medium">
              <User className="w-4 h-4" />
              Thông tin
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all font-medium">
              <Package className="w-4 h-4" />
              Đơn hàng
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all font-medium">
              <Heart className="w-4 h-4" />
              Cây yêu thích
            </TabsTrigger>
          </TabsList>

          {/* === Tab: Thông tin cá nhân + Đổi mật khẩu === */}
          <TabsContent value="profile" className="space-y-8">

            {/* Thông tin cá nhân */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-emerald-50/60 border-b border-emerald-100/60 px-6 py-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl text-slate-800">Thông tin cá nhân</CardTitle>
                      <CardDescription className="text-slate-500 mt-1.5">Cập nhật thông tin tài khoản của bạn</CardDescription>
                    </div>
                    {!isEditingProfile ? (
                      <Button onClick={handleStartEditProfile} variant="outline" className="gap-2 shrink-0 border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors">
                        <PenLine className="w-4 h-4" />
                        Chỉnh sửa
                      </Button>
                    ) : (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          onClick={handleCancelEditProfile}
                          variant="outline"
                          disabled={isLoadingProfile}
                          className="border-slate-300"
                        >
                          Hủy
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={isLoadingProfile}
                          className="bg-green-600 hover:bg-green-700 text-white gap-2 transition-colors shadow-sm"
                        >
                          {isLoadingProfile ? "Đang lưu..." : "Lưu"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="px-6 py-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">

                    {/* Họ và tên */}
                    <div className="space-y-3">
                      <Label htmlFor="fullName" className="text-slate-700 font-semibold text-[15px] flex items-center gap-1.5 mb-1.5">
                         Họ và tên
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <Input
                          id="fullName"
                          value={profileForm.fullName}
                          onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                          disabled={!isEditingProfile}
                          className={`pl-11 h-12 text-[15px] rounded-lg transition-all ${!isEditingProfile ? 'bg-slate-50 border-slate-200 text-slate-900 font-semibold disabled:opacity-100 shadow-sm' : 'border-green-200 focus-visible:ring-green-500 text-slate-800'}`}
                          placeholder="Nhập họ và tên"
                        />
                      </div>
                    </div>

                    {/* Email — chỉ đọc */}
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-slate-700 font-semibold text-[15px] flex items-center gap-1.5 mb-1.5">
                         Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          value={user?.email || ""}
                          disabled
                          className="pl-11 h-12 text-[15px] rounded-lg bg-slate-50 border-slate-200 text-slate-900 font-semibold cursor-not-allowed disabled:opacity-100 shadow-sm"
                        />
                      </div>
                      <p className="text-[13px] text-amber-600/90 font-medium pl-1">Email không thể thay đổi</p>
                    </div>

                    {/* Số điện thoại */}
                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-slate-700 font-semibold text-[15px] flex items-center gap-1.5 mb-1.5">
                         Số điện thoại
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <Input
                          id="phone"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          disabled={!isEditingProfile}
                          className={`pl-11 h-12 text-[15px] rounded-lg transition-all ${!isEditingProfile ? 'bg-slate-50 border-slate-200 text-slate-900 font-semibold disabled:opacity-100 shadow-sm' : 'border-green-200 focus-visible:ring-green-500 text-slate-800'}`}
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                    </div>

                    {/* Địa chỉ */}
                    <div className="space-y-3">
                      <Label htmlFor="address" className="text-slate-700 font-semibold text-[15px] flex items-center gap-1.5 mb-1.5">
                         Địa chỉ
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <Input
                          id="address"
                          value={profileForm.address}
                          onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                          disabled={!isEditingProfile}
                          className={`pl-11 h-12 text-[15px] rounded-lg transition-all ${!isEditingProfile ? 'bg-slate-50 border-slate-200 text-slate-900 font-semibold disabled:opacity-100 shadow-sm' : 'border-green-200 focus-visible:ring-green-500 text-slate-800'}`}
                          placeholder="Nhập địa chỉ"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Đổi mật khẩu — cơ chế giống thông tin cá nhân */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-slate-200 shadow-sm overflow-hidden mt-8">
                <CardHeader className="bg-emerald-50/60 border-b border-emerald-100/60 px-6 py-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-green-600" />
                        Đổi mật khẩu
                      </CardTitle>
                      <CardDescription className="text-slate-500 mt-1.5">Cập nhật mật khẩu để bảo mật tài khoản</CardDescription>
                    </div>
                    {!isEditingPassword ? (
                      <Button onClick={handleStartEditPassword} variant="outline" className="gap-2 shrink-0 border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors">
                        <PenLine className="w-4 h-4" />
                        Chỉnh sửa
                      </Button>
                    ) : (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          onClick={handleCancelEditPassword}
                          variant="outline"
                          disabled={isLoadingPassword}
                          className="border-slate-300"
                        >
                          Hủy
                        </Button>
                        <Button
                          onClick={handleSavePassword}
                          disabled={isLoadingPassword}
                          className="bg-green-600 hover:bg-green-700 text-white gap-2 transition-colors shadow-sm"
                        >
                          {isLoadingPassword ? "Đang lưu..." : "Lưu"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="px-6 py-8">
                  {/* Khi chưa chỉnh sửa: hiển thị placeholder mờ */}
                  {!isEditingPassword ? (
                    <div className="space-y-6 md:space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-10">
                        {["Mật khẩu hiện tại", "Mật khẩu mới", "Xác nhận mật khẩu mới"].map((label) => (
                          <div key={label} className="space-y-3">
                            <Label className="text-slate-700 font-semibold text-[15px] flex items-center gap-1.5 mb-1.5">{label}</Label>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                              <Input
                                type="password"
                                value="••••••••"
                                disabled
                                className="pl-11 h-12 text-[15px] rounded-lg bg-slate-50 border-slate-200 text-slate-900 font-bold cursor-not-allowed disabled:opacity-100 tracking-[0.3em] shadow-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[13px] text-slate-500 mt-4">
                        Bấm <strong className="text-slate-700 font-medium">Chỉnh sửa</strong> để thay đổi mật khẩu của bạn
                      </p>
                    </div>
                  ) : (
                    /* Khi đang chỉnh sửa: hiện form nhập thật */
                    <div className="space-y-8">
                      {/* Mật khẩu hiện tại */}
                      <div className="space-y-3">
                        <Label htmlFor="currentPassword" className="text-slate-700 font-semibold text-[15px] flex items-center gap-1.5 mb-1.5">
                           Mật khẩu hiện tại
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 z-10" />
                          <PasswordInput
                            id="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            placeholder="Nhập mật khẩu hiện tại"
                            className="border-green-200 focus-visible:ring-green-500 pl-11 h-12 text-[15px] rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        {/* Mật khẩu mới */}
                        <div className="space-y-3">
                          <Label htmlFor="newPassword" className="text-slate-700 font-semibold text-[15px] flex items-center gap-1.5 mb-1.5">
                             Mật khẩu mới
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 z-10" />
                            <PasswordInput
                              id="newPassword"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                              placeholder="Tối thiểu 8 ký tự"
                              className="border-green-200 focus-visible:ring-green-500 pl-11 h-12 text-[15px] rounded-lg"
                            />
                          </div>
                        </div>

                        {/* Xác nhận mật khẩu mới */}
                        <div className="space-y-3">
                          <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold text-[15px] flex items-center gap-1.5 mb-1.5">
                             Xác nhận mật khẩu mới
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 z-10" />
                            <PasswordInput
                              id="confirmPassword"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                              placeholder="Nhập lại mật khẩu mới"
                              className="border-green-200 focus-visible:ring-green-500 pl-11 h-12 text-[15px] rounded-lg"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Gợi ý yêu cầu mật khẩu */}
                      <p className="text-[13px] text-slate-500 mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        Mật khẩu mới phải có ít nhất <strong className="text-slate-700 font-medium">8 ký tự</strong>, gồm <strong className="text-slate-700 font-medium">chữ hoa</strong>, <strong className="text-slate-700 font-medium">chữ thường</strong> và <strong className="text-slate-700 font-medium">số</strong>.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* === Tab: Đơn hàng === */}
          <TabsContent value="orders" className="space-y-4">
            {mockOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono font-semibold">{order.id}</span>
                          <Badge variant={order.status === "Đã giao" ? "default" : "secondary"}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {order.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {order.items} sản phẩm
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Tổng tiền</p>
                          <p className="text-xl font-bold text-primary">{order.total}</p>
                        </div>
                        <Button variant="outline">Xem chi tiết</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* === Tab: Cây yêu thích === */}
          <TabsContent value="saved" className="space-y-4">
            {mockSavedPlants.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="Chưa có cây yêu thích"
                description="Bạn chưa lưu cây nào. Khám phá và lưu những cây cảnh yêu thích của bạn!"
                action={{ label: "Khám phá cây cảnh", onClick: () => navigate("/browse") }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockSavedPlants.map((plant, index) => (
                  <motion.div
                    key={plant.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                      <div className="aspect-square overflow-hidden relative">
                        <img
                          src={plant.image}
                          alt={plant.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3">
                          <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors">
                            <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                          </button>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-1">{plant.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Đã lưu: {plant.savedDate}
                        </p>
                        <Button className="w-full mt-4" variant="outline">Xem chi tiết</Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export { Profile };
