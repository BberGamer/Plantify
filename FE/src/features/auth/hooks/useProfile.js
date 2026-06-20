// useProfile.js - Hook quản lý logic cho trang Profile
// Bao gồm: cập nhật thông tin cá nhân và đổi mật khẩu

import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { updateProfileApi, changePasswordApi } from "../api";
import { toast } from "sonner";

/**
 * Hook quản lý state và logic toàn bộ trang Profile
 * @returns {object} - profileData, passwordData, trạng thái editing và các handlers
 */
export function useProfile() {
  const { user, updateUser } = useAuth();

  // === State chỉnh sửa thông tin cá nhân ===
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  // Cập nhật lại form khi user đã load xong (xử lý case F5/reload trang)
  useEffect(() => {
    if (user && !isEditingProfile) {
      setProfileForm({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user, isEditingProfile]);

  // === State đổi mật khẩu ===
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  /**
   * Bắt đầu chỉnh sửa thông tin cá nhân — đồng bộ form với user hiện tại
   */
  const handleStartEditProfile = () => {
    setProfileForm({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
    setIsEditingProfile(true);
  };

  /**
   * Hủy chỉnh sửa thông tin cá nhân — khôi phục form về giá trị gốc
   */
  const handleCancelEditProfile = () => {
    setProfileForm({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
    setIsEditingProfile(false);
  };

  /**
   * Lưu thông tin cá nhân — gọi API cập nhật và cập nhật context
   */
  const handleSaveProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const res = await updateProfileApi(profileForm);
      if (res?.success) {
        updateUser(res.data);
        setIsEditingProfile(false);
        toast.success("Cập nhật thông tin thành công!");
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Cập nhật thông tin thất bại";
      toast.error(message);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  /**
   * Bắt đầu chỉnh sửa mật khẩu — hiện form nhập
   */
  const handleStartEditPassword = () => {
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setIsEditingPassword(true);
  };

  /**
   * Hủy đổi mật khẩu — ẩn form và reset dữ liệu
   */
  const handleCancelEditPassword = () => {
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setIsEditingPassword(false);
  };

  /**
   * Lưu mật khẩu mới — validate phía client rồi gọi API
   */
  const handleSavePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    // Validate phía client trước khi gọi API
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin mật khẩu");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      toast.error("Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setIsLoadingPassword(true);
      const res = await changePasswordApi(passwordForm);
      if (res?.success) {
        setIsEditingPassword(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        toast.success("Đổi mật khẩu thành công!");
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Đổi mật khẩu thất bại";
      toast.error(message);
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return {
    user,
    // Profile editing
    isEditingProfile,
    isLoadingProfile,
    profileForm,
    setProfileForm,
    handleStartEditProfile,
    handleCancelEditProfile,
    handleSaveProfile,
    // Password editing
    isEditingPassword,
    isLoadingPassword,
    passwordForm,
    setPasswordForm,
    handleStartEditPassword,
    handleCancelEditPassword,
    handleSavePassword,
  };
}

export default useProfile;
