import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

function ProfileInformationTab({ PasswordInput, handleCancelEditPassword, handleCancelEditProfile, handleSavePassword, handleSaveProfile, handleStartEditPassword, handleStartEditProfile, inputClass, isEditingPassword, isEditingProfile, isLoadingPassword, isLoadingProfile, passwordForm, profileForm, setPasswordForm, setProfileForm }) {
  return (
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
                          <Lock className="profile-input-icon profile-input-icon-lifted" />
                          <PasswordInput id="currentPassword" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} placeholder="Nhập mật khẩu hiện tại" className="border-green-200 focus-visible:ring-green-500 pl-11 h-12 text-[15px] rounded-lg" />
                        </div>
                      </div>

                      {/* Mật khẩu mới + Xác nhận */}
                      <div className="profile-form-grid profile-form-grid-nopad">
                        <div className="profile-field">
                          <Label htmlFor="newPassword" className="profile-field-label">Mật khẩu mới</Label>
                          <div className="profile-input-wrapper">
                            <Lock className="profile-input-icon profile-input-icon-lifted" />
                            <PasswordInput id="newPassword" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} placeholder="Tối thiểu 8 ký tự" className="border-green-200 focus-visible:ring-green-500 pl-11 h-12 text-[15px] rounded-lg" />
                          </div>
                        </div>

                        <div className="profile-field">
                          <Label htmlFor="confirmPassword" className="profile-field-label">Xác nhận mật khẩu mới</Label>
                          <div className="profile-input-wrapper">
                            <Lock className="profile-input-icon profile-input-icon-lifted" />
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
  );
}

export { ProfileInformationTab };
