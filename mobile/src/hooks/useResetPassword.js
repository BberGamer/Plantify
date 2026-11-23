import getErrorMessage from "../utils/getErrorMessage";
// useResetPassword.js - Quản lý các bước đặt lại mật khẩu bằng OTP.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import authService from "../services/authService";
import useOtpCountdown from "./useOtpCountdown";
import useScreenScope from "./useScreenScope";

export default function useResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const pending = useRef(false);
  const mounted = useRef(false);
  const redirectTimer = useRef(null);
  const countdown = useOtpCountdown(codeSent);
  const { capture, isActive } = useScreenScope(undefined, () => clearTimeout(redirectTimer.current));

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(redirectTimer.current);
    };
  }, []);

  const changeEmail = (value) => {
    if (pending.current || resetSuccess) return;
    setEmail(value);
    setCodeSent(false);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMsg("");
    setSuccessMsg("");
    countdown.resetCountdown();
  };

  const sendCode = async () => {
    if (pending.current || resetSuccess || !isActive() || (codeSent && !countdown.canResend())) return;
    const isCurrent = capture();
    if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim())
    ) {
      setErrorMsg("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }
    pending.current = true;
    setSendingCode(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await authService.forgotPassword(email.trim());
      if (!response?.success)
        throw new Error(response?.message || "Không thể gửi mã xác thực.");
      if (!isCurrent()) return;
      setCodeSent(true);
      setOtp("");
      countdown.startCountdown();
      setSuccessMsg(
        response.message || "Mã xác thực đã được gửi đến email của bạn.",
      );
    } catch (error) {
      if (isCurrent())
        setErrorMsg(
          getErrorMessage(error, "Gửi mã xác thực thất bại."),
        );
    } finally {
      pending.current = false;
      if (mounted.current) setSendingCode(false);
    }
  };

  const confirmReset = async () => {
    if (pending.current || resetSuccess || !isActive()) return;
    const isCurrent = capture();
    let message = "";
    if (!codeSent || !/^\d{6}$/.test(otp))
      message = "Vui lòng nhập đủ 6 chữ số mã xác thực.";
    else if (newPassword.length < 8)
      message = "Mật khẩu mới phải có tối thiểu 8 ký tự.";
    else if (newPassword !== confirmPassword)
      message = "Mật khẩu xác nhận không khớp.";
    if (message) {
      setErrorMsg(message);
      return;
    }
    pending.current = true;
    setUpdatingPassword(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await authService.resetPassword({
        email: email.trim(),
        otp,
        newPassword,
      });
      if (!response?.success)
        throw new Error(response?.message || "Không thể đặt lại mật khẩu.");
      if (!isCurrent()) return;
      setResetSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      redirectTimer.current = setTimeout(() => {
        if (isCurrent()) router.replace("/auth/login");
      }, 2000);
    } catch (error) {
      if (isCurrent())
        setErrorMsg(
          getErrorMessage(error, "Đặt lại mật khẩu thất bại."),
        );
    } finally {
      pending.current = false;
      if (mounted.current) setUpdatingPassword(false);
    }
  };

  return {
    email,
    otp,
    newPassword,
    confirmPassword,
    codeSent,
    sendingCode,
    updatingPassword,
    errorMsg,
    successMsg,
    resetSuccess,
    countdown: countdown.countdown,
    isOtpComplete: codeSent && /^\d{6}$/.test(otp),
    changeEmail,
    sendCode,
    confirmReset,
    changeOtp: (value) => {
      if (!pending.current && codeSent && !resetSuccess) {
        setOtp(value);
        setErrorMsg("");
      }
    },
    changeNewPassword: (value) => {
      if (!pending.current && codeSent && !resetSuccess) {
        setNewPassword(value);
        setErrorMsg("");
      }
    },
    changeConfirmPassword: (value) => {
      if (!pending.current && codeSent && !resetSuccess) {
        setConfirmPassword(value);
        setErrorMsg("");
      }
    },
    goBack: () => {
      if (!pending.current) router.back();
    },
  };
}
