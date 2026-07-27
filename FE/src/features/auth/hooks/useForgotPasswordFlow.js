import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { usePasswordResetMutations } from "@/features/auth/hooks/useAuthMutations";

export function useForgotPasswordFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errors, setErrors] = useState({});
  const [resendCountdown, setResendCountdown] = useState(0);
  const otpRefs = useRef([]);
  const {
    resendPasswordResetOtp,
    resending,
    sendPasswordResetOtp,
    sending,
    verifyPasswordResetOtp,
    verifying,
  } = usePasswordResetMutations();

  useEffect(() => {
    if (resendCountdown <= 0) return undefined;
    const timer = window.setInterval(() => {
      setResendCountdown((current) => current - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCountdown]);

  const validateEmail = (value) => {
    if (!value || !value.trim()) return "Email là bắt buộc";
    if (!/^[a-zA-Z0-9._%+\-]+@(gmail\.com|yahoo\.com|fpt\.edu\.vn)$/i.test(value.trim())) {
      return "Email không đúng định dạng";
    }
    return "";
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }
    setErrors({});
    try {
      await sendPasswordResetOtp(email.trim());
      setStep(2);
      setResendCountdown(20);
      toast.success("Mã OTP 6 số đã được gửi đến Gmail của bạn!");
    } catch (error) {
      const message = error.response?.data?.message
        || error.message
        || "Đã có lỗi xảy ra.";
      toast.error(message);
      setErrors({ email: message });
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    try {
      await resendPasswordResetOtp(email.trim());
      setOtp(["", "", "", "", "", ""]);
      setErrors({});
      setResendCountdown(20);
      otpRefs.current[0]?.focus();
      toast.success("Đã gửi lại mã OTP mới!");
    } catch {
      toast.error("Gửi lại OTP thất bại. Vui lòng thử lại.");
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);
    if (errors.otp) setErrors({});
    if (value !== "" && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setErrors({ otp: "Vui lòng nhập đủ 6 chữ số" });
      return;
    }
    setErrors({});
    try {
      await verifyPasswordResetOtp(email.trim(), fullOtp);
      sessionStorage.setItem("otp_email", email.trim());
      sessionStorage.setItem("otp_code", fullOtp);
      toast.success("OTP hợp lệ! Đang chuyển đến trang đặt lại mật khẩu...");
      navigate("/reset-password");
    } catch (error) {
      const message = error.response?.data?.message
        || error.message
        || "Xác thực OTP thất bại.";
      toast.error(message);
      setErrors({ otp: message });
    }
  };

  const changeEmail = () => {
    setStep(1);
    setOtp(["", "", "", "", "", ""]);
    setErrors({});
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    if (errors.email) setErrors({});
  };

  return {
    changeEmail,
    email,
    errors,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    handleResendOtp,
    handleSendOtp,
    handleVerifyOtp,
    handleEmailChange,
    otp,
    otpRefs,
    resendCountdown,
    resending,
    step,
    submitting: sending || verifying,
  };
}
