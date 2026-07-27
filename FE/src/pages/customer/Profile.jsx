// Profile.jsx
// Trang hồ sơ người dùng: hiển thị thông tin thật từ DB, chức vụ, đổi mật khẩu theo cơ chế nút chỉnh sửa

// Profile.jsx
// Trang hồ sơ người dùng: hiển thị thông tin thật từ DB, chức vụ, đổi mật khẩu theo cơ chế nút chỉnh sửa

import { useNavigate, useSearchParams } from "react-router";



import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import { User, Mail, Package, Heart, Calendar, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useCustomerProfile } from "@/features/auth/hooks";
import "@/styles/Profile.css";
import { ProfileOrdersTab } from "@/features/auth/components/profile/ProfileOrdersTab";
import { ProfileFavoritesTab } from "@/features/auth/components/profile/ProfileFavoritesTab";
import { ProfilePasswordCard } from "@/features/auth/components/profile/ProfilePasswordCard";
import { ProfilePersonalInformationCard } from "@/features/auth/components/profile/ProfilePersonalInformationCard";
import {
  CANCELLATION_REASON_LABELS,
  FAV_PER_PAGE,
  PAYMENT_STATUS_CONFIG,
  STATUS_CONFIG,
  RoleBadge,
  formatJoinDate,
  formatOrderDate,
  formatVND,
  getInitials,
  getRemainingPayment,
} from "@/features/auth/profilePage.utils";

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
            <TabsList
              className={`grid rounded-xl bg-slate-100/80 p-1.5 ${
                user?.role === "customer"
                  ? "w-full grid-cols-3 lg:w-auto"
                  : "w-full max-w-[250px] grid-cols-1"
              }`}
            >
              <TabsTrigger value="profile" className="profile-tab-trigger">
                <User className="w-4 h-4" />
                Thông tin
              </TabsTrigger>
              {user?.role === "customer" && (
                <>
                  <TabsTrigger value="orders" className="profile-tab-trigger">
                    <Package className="w-4 h-4" />
                    Đơn hàng
                  </TabsTrigger>
                  <TabsTrigger value="saved" className="profile-tab-trigger">
                    <Heart className="w-4 h-4" />
                    Cây yêu thích
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </div>

          {/* === Tab: Thông tin cá nhân === */}
          <TabsContent value="profile" className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <ProfilePersonalInformationCard
                inputClass={inputClass}
                isEditing={isEditingProfile}
                isLoading={isLoadingProfile}
                onCancel={handleCancelEditProfile}
                onChange={(field, value) => {
                  setProfileForm({ ...profileForm, [field]: value });
                }}
                onSave={handleSaveProfile}
                onStartEdit={handleStartEditProfile}
                profileForm={profileForm}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ProfilePasswordCard
                isEditing={isEditingPassword}
                isLoading={isLoadingPassword}
                onCancel={handleCancelEditPassword}
                onChange={(field, value) => {
                  setPasswordForm({ ...passwordForm, [field]: value });
                }}
                onSave={handleSavePassword}
                onStartEdit={handleStartEditPassword}
                passwordForm={passwordForm}
              />
            </motion.div>
          </TabsContent>

          {/* === Tab: Đơn hàng (chỉ customer) === */}
          {user?.role === "customer" && (
            <ProfileOrdersTab
              CANCELLATION_REASON_LABELS={CANCELLATION_REASON_LABELS}
              PAYMENT_STATUS_CONFIG={PAYMENT_STATUS_CONFIG}
              STATUS_CONFIG={STATUS_CONFIG}
              formatOrderDate={formatOrderDate}
              formatVND={formatVND}
              getRemainingPayment={getRemainingPayment}
              handleCustomerAction={handleCustomerAction}
              navigate={navigate}
              orders={orders}
              ordersLoading={ordersLoading}
            />
          )}

          {/* === Tab: Cây yêu thích (chỉ customer) === */}
          {user?.role === "customer" && (
            <ProfileFavoritesTab
              FAV_PER_PAGE={FAV_PER_PAGE}
              favLoading={favLoading}
              favPage={favPage}
              favTotalPages={favTotalPages}
              favorites={favorites}
              handleUnfavorite={handleUnfavorite}
              navigate={navigate}
              setFavPage={setFavPage}
            />
          )}
        </Tabs>
      </div>
    </div>
  );
}

export { Profile };
