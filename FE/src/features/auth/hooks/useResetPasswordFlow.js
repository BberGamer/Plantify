// useResetPasswordFlow.js - Quản lý trạng thái và vòng đời đặt lại mật khẩu
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { usePasswordResetMutations } from "@/features/auth/hooks/useAuthMutations";

/**
 * Điều phối form đặt mật khẩu mới, kiểm tra độ mạnh và gửi request reset.
 * @returns {Object} State mật khẩu, lỗi validation và handler submit.
 */
export function useResetPasswordFlow() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", otpCode: "" });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRequirements, setShowRequirements] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [countdown, setCountdown] = useState(5);
  const { resetPassword, resetting: submitting } = usePasswordResetMutations();

  useEffect(() => {
    const email = sessionStorage.getItem("otp_email");
    const otpCode = sessionStorage.getItem("otp_code");
    if (!email || !otpCode) {
      toast.error("Phiên xác thực không hợp lệ. Vui lòng bắt đầu lại.");
      navigate("/forgot-password", { replace: true });
      return;
    }
    setCredentials({ email, otpCode });
  }, [navigate]);

  useEffect(() => {
    if (!success) return undefined;
    const timer = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          navigate("/login", { replace: true });
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [navigate, success]);

  const validate = () => {
    const nextErrors = {};
    if (!password) {
      nextErrors.password = "Mật khẩu mới là bắt buộc";
    } else if (password.length < 8) {
      nextErrors.password = "Mật khẩu phải có tối thiểu 8 ký tự";
    } else if (!/[A-Z]/.test(password)) {
      nextErrors.password = "Mật khẩu phải chứa ít nhất 1 chữ hoa";
    } else if (!/[a-z]/.test(password)) {
      nextErrors.password = "Mật khẩu phải chứa ít nhất 1 chữ thường";
    } else if (!/[0-9]/.test(password)) {
      nextErrors.password = "Mật khẩu phải chứa ít nhất 1 chữ số";
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    return nextErrors;
  };

  const changePassword = (value) => {
    setPassword(value);
    if (errors.password) {
      setErrors((current) => ({ ...current, password: "" }));
    }
  };
  const changeConfirmPassword = (value) => {
    setConfirmPassword(value);
    if (errors.confirmPassword) {
      setErrors((current) => ({ ...current, confirmPassword: "" }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    try {
      await resetPassword(
        credentials.email,
        credentials.otpCode,
        password,
        confirmPassword
      );
      sessionStorage.removeItem("otp_email");
      sessionStorage.removeItem("otp_code");
      setSuccess(true);
      toast.success("Đặt lại mật khẩu thành công!");
    } catch (error) {
      const message = error.response?.data?.message
        || error.message
        || "Đã có lỗi xảy ra.";
      toast.error(message);
      if (message.includes("hết hạn") || message.includes("không tồn tại")) {
        sessionStorage.removeItem("otp_email");
        sessionStorage.removeItem("otp_code");
        window.setTimeout(() => navigate("/forgot-password"), 2000);
      }
      setErrors({ general: message });
    }
  };

  return {
    changeConfirmPassword,
    changePassword,
    confirmPassword,
    countdown,
    errors,
    handleSubmit,
    password,
    setShowRequirements,
    showRequirements,
    submitting,
    success,
  };
}
