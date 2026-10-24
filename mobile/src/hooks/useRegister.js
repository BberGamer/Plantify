import getErrorMessage from "../utils/getErrorMessage";
// useRegister.js - Quản lý form đăng ký, gửi OTP và tạo phiên đăng nhập.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import authService from "../services/authService";
import useAuthStore from "../../store/authStore";
import { getSessionContext, isSessionCurrent } from "../services/sessionAccess";
import useOtpCountdown from "./useOtpCountdown";

export default function useRegister() {
  const router = useRouter();
  const setAuthSession = useAuthStore((state) => state.setAuthSession);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const pending = useRef(false);
  const mounted = useRef(false);
  const countdown = useOtpCountdown(step === 2);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const changeField = (key, value) => {
    if (pending.current) return;
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrorMsg("");
    setSuccessMsg("");
  };

  const send = async (resend) => {
    if (pending.current || (resend && !countdown.canResend())) return;
    let message = "";
    if (!form.fullName.trim()) message = "Vui lòng nhập họ và tên.";
    else if (!form.email.trim()) message = "Vui lòng nhập địa chỉ email.";
    else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
        form.email.trim(),
      )
    )
      message = "Email không đúng định dạng.";
    else if (form.password.length < 8)
      message = "Mật khẩu phải có tối thiểu 8 ký tự.";
    else if (form.password !== form.confirmPassword)
      message = "Mật khẩu xác nhận không khớp.";
    else if (!form.agreeTerms)
      message = "Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách.";
    if (message) {
      setErrorMsg(message);
      return;
    }

    pending.current = true;
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await authService.sendRegisterOTP({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      if (!response?.success)
        throw new Error(response?.message || "Không thể gửi mã xác thực.");
      if (!mounted.current) return;
      setStep(2);
      setOtp("");
      countdown.startCountdown();
      if (resend)
        setSuccessMsg("Mã xác thực mới đã được gửi lại tới email của bạn.");
    } catch (error) {
      if (mounted.current)
        setErrorMsg(
          getErrorMessage(error, "Gửi mã xác thực thất bại."),
        );
    } finally {
      pending.current = false;
      if (mounted.current) setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (pending.current) return;
    if (!/^\d{6}$/.test(otp)) {
      setErrorMsg("Vui lòng nhập đủ 6 chữ số mã xác thực.");
      return;
    }
    pending.current = true;
    setLoading(true);
    setErrorMsg("");
    const origin = getSessionContext();
    try {
      const response = await authService.verifyRegisterOTP({
        email: form.email.trim(),
        otp,
      });
      if (
        !response?.success ||
        !response.data?.user ||
        typeof response.data?.token !== "string"
      ) {
        throw new Error(
          response?.message || "Thông tin phiên đăng nhập không hợp lệ.",
        );
      }
      if (!mounted.current || !isSessionCurrent(origin)) return;
      const result = await setAuthSession(response.data.user, response.data.token, origin);
      if (!mounted.current) return;
      if (result.success) {
        setForm((previous) => ({ ...previous, password: "", confirmPassword: "" }));
      } else if (!result.cancelled) setErrorMsg(result.error);

    } catch (error) {
      if (mounted.current && isSessionCurrent(origin))
        setErrorMsg(
          getErrorMessage(error, "Không thể xác thực mã."),
        );
    } finally {
      pending.current = false;
      if (mounted.current) setLoading(false);
    }
  };

  const goBack = () => {
    if (pending.current) return;
    if (step === 1) {
      router.back();
      return;
    }
    setStep(1);
    setOtp("");
    setErrorMsg("");
    setSuccessMsg("");
    countdown.resetCountdown();
  };

  return {
    form,
    step,
    otp,
    loading,
    errorMsg,
    successMsg,
    countdown: countdown.countdown,
    changeField,
    changeOtp: (value) => {
      if (!pending.current) {
        setOtp(value);
        setErrorMsg("");
      }
    },
    sendOTP: () => send(false),
    resendOTP: () => send(true),
    verifyOTP,
    goBack,
  };
}
