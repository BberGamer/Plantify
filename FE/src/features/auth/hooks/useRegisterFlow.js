// useRegisterFlow.js - Quản lý trạng thái biểu mẫu và tiến trình đăng ký tài khoản
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useRegistrationMutations } from "@/features/auth/hooks/useAuthMutations";

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  confirmPassword: "",
};

/**
 * Điều phối form đăng ký, validation và chuyển sang bước xác minh OTP.
 * @returns {Object} Dữ liệu form, lỗi, trạng thái hiển thị và handler đăng ký.
 */
export function useRegisterFlow() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { sendRegistrationOtp, sending: submitting } = useRegistrationMutations();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: "" }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    const { fullName, email, password, confirmPassword, phone } = formData;
    if (!fullName?.trim()) nextErrors.fullName = "Họ và tên là bắt buộc";
    if (!email?.trim()) {
      nextErrors.email = "Email là bắt buộc";
    } else if (!/^[a-zA-Z0-9._%+\-]+@(gmail\.com|yahoo\.com|fpt\.edu\.vn)$/i.test(email.trim())) {
      nextErrors.email = "Email không đúng định dạng";
    }
    if (phone?.trim() && !/^(0[3|5|7|8|9])+([0-9]{8})$/.test(phone.trim())) {
      nextErrors.phone = "Số điện thoại không hợp lệ (bắt đầu 03/05/07/08/09, 10 chữ số)";
    }
    if (!password) {
      nextErrors.password = "Mật khẩu là bắt buộc";
    } else if (password.length < 8) {
      nextErrors.password = "Mật khẩu phải chứa tối thiểu 8 ký tự";
    }
    if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Mật khẩu xác nhận không trùng khớp";
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const registrationData = {
      fullName: formData.fullName,
      email: formData.email.trim(),
      phone: formData.phone,
      address: formData.address,
      password: formData.password,
    };
    try {
      await sendRegistrationOtp(registrationData);
      toast.success("Mã OTP 6 số đã được gửi đến Gmail của bạn!");
      navigate("/register/verify-otp", { state: registrationData });
    } catch (error) {
      const message = error.response?.data?.message
        || error.message
        || "Đã có lỗi xảy ra.";
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes("email đã") || lowerMessage.includes("email không hợp lệ")) {
        setErrors({ email: message });
      } else if (
        lowerMessage.includes("điện thoại")
        || lowerMessage.includes("phone")
        || lowerMessage.includes("số điện")
      ) {
        setErrors({ phone: message });
      } else {
        toast.error(message);
      }
    }
  };

  return { errors, formData, handleChange, handleSubmit, submitting };
}
