// Profile.jsx
// Trang hồ sơ người dùng: hiển thị thông tin thật từ DB, chức vụ, đổi mật khẩu theo cơ chế nút chỉnh sửa

import { useNavigate, Link, useSearchParams } from "react-router";
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
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useCustomerProfile } from "@/features/auth/hooks";
import "@/styles/Profile.css";
import { ProfileInformationTab } from "@/features/auth/components/profile/ProfileInformationTab";
import { ProfileOrdersTab } from "@/features/auth/components/profile/ProfileOrdersTab";
import { ProfileFavoritesTab } from "@/features/auth/components/profile/ProfileFavoritesTab";

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

// === Cấu hình hiển thị trạng thái đơn hàng (khớp với enum order.model.js) ===
const STATUS_CONFIG = {
  pending: {
    label: "Chờ xử lý",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  packing: {
    label: "Đang đóng hàng",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  sented: {
    label: "Đã gửi hàng",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  succeeded: {
    label: "Nhận hàng thành công",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  returning: {
    label: "Đang hoàn trả",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

const PAYMENT_STATUS_CONFIG = {
  pending: {
    label: "Chưa thanh toán",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  paid: {
    label: "Đã thanh toán",
    className: "bg-teal-50 text-teal-700 border-teal-200",
  },
  failed: {
    label: "Thanh toán lỗi",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  refunded: {
    label: "Đã hoàn vào ví",
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },
};

const CANCELLATION_REASON_LABELS = {
  out_of_stock: "Hết hàng",
  defective_product: "Hàng lỗi",
  weather_incident: "Sự cố thời tiết",
  no_carrier: "Không có người vận chuyển",
  customer_return: "Khách hàng hoàn trả",
  customer_cancelled: "Khách hàng chủ động hủy",
  payment_failed: "Thanh toán không thành công",
};

/** Format giá tiền sang VND */
function formatVND(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function getRemainingPayment(order) {
  return Math.max(
    0,
    Number(order?.total || 0) - Number(order?.walletAmount || 0)
  );
}

/** Format ngày đặt hàng đầy đủ */
function formatOrderDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Số cây yêu thích hiển thị mỗi trang
const FAV_PER_PAGE = 6;



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
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(requestedTab === "orders" ? "orders" : "profile");
  const {
    favorites,
    favLoading,
    handleCustomerAction,
    handleUnfavorite,
    handleStartEditProfile,
    handleCancelEditProfile,
    handleSaveProfile,
    handleStartEditPassword,
    handleCancelEditPassword,
    handleSavePassword,
    isEditingPassword,
    isEditingProfile,
    isLoadingPassword,
    isLoadingProfile,
    orders,
    ordersLoading,
    passwordForm,
    profileForm,
    setPasswordForm,
    setProfileForm,
    user,
    wallet,
  } = useCustomerProfile();

  // === Pagination cho cây yêu thích ===
  const [favPage, setFavPage] = useState(1);
  const favTotalPages = Math.ceil(favorites.length / FAV_PER_PAGE);

  // Reset về trang 1 khi danh sách thay đổi hoặc trang vượt quá
  useEffect(() => {
    if (favPage > favTotalPages && favTotalPages > 0) {
      setFavPage(favTotalPages);
    }
  }, [favorites.length, favPage, favTotalPages]);

  useEffect(() => {
    if (requestedTab === "orders") {
      setActiveTab("orders");
    }
  }, [requestedTab]);

  const handleTabChange = (value) => {
    setActiveTab(value);
    if (value === "orders") {
      setSearchParams({ tab: "orders" });
      return;
    }
    setSearchParams({});
  };

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

        {user?.role === "customer" && (
          <Card className="mb-6 border-emerald-200 bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-emerald-50">Số dư ví Plantify</p>
                <p className="mt-1 text-3xl font-bold">{formatVND(wallet.balance)}</p>
                <p className="mt-1 text-xs text-emerald-50">
                  Tiền hoàn từ đơn hủy có thể dùng cho lần mua tiếp theo
                </p>
              </div>
              <Wallet className="h-12 w-12 text-white/80" />
            </CardContent>
          </Card>
        )}

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
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
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
          <ProfileInformationTab PasswordInput={PasswordInput} handleCancelEditPassword={handleCancelEditPassword} handleCancelEditProfile={handleCancelEditProfile} handleSavePassword={handleSavePassword} handleSaveProfile={handleSaveProfile} handleStartEditPassword={handleStartEditPassword} handleStartEditProfile={handleStartEditProfile} inputClass={inputClass} isEditingPassword={isEditingPassword} isEditingProfile={isEditingProfile} isLoadingPassword={isLoadingPassword} isLoadingProfile={isLoadingProfile} passwordForm={passwordForm} profileForm={profileForm} setPasswordForm={setPasswordForm} setProfileForm={setProfileForm} />

          {/* === Tab: Đơn hàng (chỉ customer) === */}
          {user?.role === "customer" && (
            <ProfileOrdersTab CANCELLATION_REASON_LABELS={CANCELLATION_REASON_LABELS} PAYMENT_STATUS_CONFIG={PAYMENT_STATUS_CONFIG} STATUS_CONFIG={STATUS_CONFIG} formatOrderDate={formatOrderDate} formatVND={formatVND} getRemainingPayment={getRemainingPayment} handleCustomerAction={handleCustomerAction} navigate={navigate} orders={orders} ordersLoading={ordersLoading} />
          )}

          {/* === Tab: Cây yêu thích (chỉ customer) === */}
          {user?.role === "customer" && (
            <ProfileFavoritesTab FAV_PER_PAGE={FAV_PER_PAGE} favLoading={favLoading} favPage={favPage} favTotalPages={favTotalPages} favorites={favorites} handleUnfavorite={handleUnfavorite} navigate={navigate} setFavPage={setFavPage} />
          )}
        </Tabs>
      </div>
    </div>
  );
}

export { Profile };
