import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { useRegistrationMutations } from "@/features/auth/hooks/useAuthMutations";

export function useRegisterVerificationFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendCountdown, setResendCountdown] = useState(20);
  const [errors, setErrors] = useState({});
  const otpRefs = useRef([]);
  const {
    resendRegistrationOtp,
    resending,
    verifyRegistrationOtp,
    verifying: submitting,
  } = useRegistrationMutations();

  useEffect(() => {
    if (email) return;
    toast.error("Vui lòng thực hiện đăng ký trước.");
    navigate("/register", { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    if (resendCountdown <= 0) return undefined;
    const timer = window.setInterval(() => {
      setResendCountdown((current) => current - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCountdown]);

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
      await verifyRegistrationOtp(email, fullOtp);
      toast.success("Đăng ký tài khoản thành công! Hãy đăng nhập.");
      navigate("/login");
    } catch (error) {
      const message = error.response?.data?.message
        || error.message
        || "Xác thực OTP thất bại.";
      toast.error(message);
      setErrors({ otp: message });
    }
  };
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || !location.state) return;
    try {
      await resendRegistrationOtp(location.state);
      setOtp(["", "", "", "", "", ""]);
      setErrors({});
      setResendCountdown(20);
      otpRefs.current[0]?.focus();
      toast.success("Đã gửi lại mã OTP mới!");
    } catch {
      toast.error("Gửi lại OTP thất bại. Vui lòng thử lại.");
    }
  };

  return {
    email,
    errors,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    handleResendOtp,
    handleVerifyOtp,
    otp,
    otpRefs,
    resendCountdown,
    resending,
    submitting,
  };
}
