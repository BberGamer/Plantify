// ForgotPassword.jsx - Trang quên mật khẩu: nhập email nhận OTP và xác thực OTP 6 số
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Leaf,
  Mail,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { forgotPasswordApi, verifyOtpApi } from "@/features/auth/api";
import { toast } from "sonner";

function ForgotPassword() {
  const navigate = useNavigate();

  // step: 1 = nhập email, 2 = nhập OTP
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [resending, setResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const otpRefs = useRef([]);

  // Xử lý đếm ngược gửi lại OTP
  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // ------- Bước 1: Xử lý gửi OTP -------
  const validateEmail = (val) => {
    if (!val || !val.trim()) return "Email là bắt buộc";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return "Email không đúng định dạng";
    return "";
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) {
      setErrors({ email: emailErr });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await forgotPasswordApi(email.trim());
      setStep(2);
      setResendCountdown(20); // Bắt đầu đếm ngược 20s
      toast.success("Mã OTP 6 số đã được gửi đến Gmail của bạn!");
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Đã có lỗi xảy ra.";
      toast.error(msg);
      setErrors({ email: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    setResending(true);
    try {
      await forgotPasswordApi(email.trim());
      setOtp(["", "", "", "", "", ""]);
      setErrors({});
      setResendCountdown(20); // Đếm ngược 20s khi gửi lại
      otpRefs.current[0]?.focus();
      toast.success("Đã gửi lại mã OTP mới!");
    } catch (error) {
      toast.error("Gửi lại OTP thất bại. Vui lòng thử lại.");
    } finally {
      setResending(false);
    }
  };

  // ------- Bước 2: Xử lý xác thực OTP -------
  const handleOtpChange = (value, idx) => {
    if (!/^\d?$/.test(value)) return; // chỉ nhận chữ số
    const next = [...otp];
    next[idx] = value;
    setOtp(next);
    if (errors.otp) setErrors({});
    if (value !== "" && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setErrors({ otp: "Vui lòng nhập đủ 6 chữ số" });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await verifyOtpApi(email.trim(), fullOtp);
      // Lưu email + otp vào sessionStorage để trang reset-password dùng
      sessionStorage.setItem("otp_email", email.trim());
      sessionStorage.setItem("otp_code", fullOtp);
      toast.success("OTP hợp lệ! Đang chuyển đến trang đặt lại mật khẩu...");
      navigate("/reset-password");
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Xác thực OTP thất bại.";
      toast.error(msg);
      setErrors({ otp: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1604762524889-3e2fcc145683?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920"
          alt="Plant background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-green-50/95 to-white/95" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to="/" className="group inline-flex items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-green-600 shadow-lg transition-transform group-hover:scale-110">
              <Leaf className="h-8 w-8 text-white" />
            </div>
            <span className="bg-gradient-to-br from-primary to-green-700 bg-clip-text text-3xl font-bold text-transparent">
              Plantify
            </span>
          </Link>
        </div>

        {/* Step indicator */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${step >= 1 ? "bg-primary text-white" : "bg-gray-100 text-gray-400"}`}>1</div>
          <div className={`h-1 w-12 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-gray-200"}`} />
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${step >= 2 ? "bg-primary text-white" : "bg-gray-100 text-gray-400"}`}>2</div>
        </div>

        <Card className="border-2 border-green-100 bg-white/95 shadow-2xl backdrop-blur-sm">
          <AnimatePresence mode="wait">
            {/* ===== Bước 1: Nhập Email ===== */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <CardHeader className="space-y-1">
                  <CardTitle className="text-center text-2xl">Quên mật khẩu</CardTitle>
                  <CardDescription className="text-center">
                    Nhập email đã đăng ký để nhận mã OTP 6 số qua Gmail
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleSendOtp} noValidate>
                    <div className="space-y-2">
                      <Label htmlFor="email">Địa chỉ Gmail</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@gmail.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors({});
                          }}
                          className={`pl-10 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          disabled={submitting}
                          autoComplete="email"
                          autoFocus
                        />
                      </div>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-1.5 text-sm text-red-500"
                        >
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          {errors.email}
                        </motion.p>
                      )}
                    </div>

                    <Button
                      id="btn-send-otp"
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90"
                      size="lg"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang gửi OTP...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Gửi mã OTP qua Gmail
                        </>
                      )}
                    </Button>

                    <Button type="button" variant="ghost" className="w-full" asChild>
                      <Link to="/login">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại đăng nhập
                      </Link>
                    </Button>
                  </form>
                </CardContent>
              </motion.div>
            )}

            {/* ===== Bước 2: Nhập OTP ===== */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <CardHeader className="space-y-1">
                  <div className="flex justify-center pb-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                      <ShieldCheck className="h-7 w-7 text-green-600" />
                    </div>
                  </div>
                  <CardTitle className="text-center text-2xl">Nhập mã OTP</CardTitle>
                  <CardDescription className="text-center">
                    Mã OTP 6 số đã gửi đến{" "}
                    <strong className="text-green-700 break-all">{email}</strong>
                    <br />
                    <span className="text-xs text-amber-600">⏱ Mã có hiệu lực trong 5 phút</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-5" onSubmit={handleVerifyOtp} noValidate>
                    {/* 6 ô OTP */}
                    <div className="space-y-2">
                      <Label className="block text-center text-sm font-medium">
                        Nhập 6 chữ số từ email
                      </Label>
                      <div
                        className="flex justify-center gap-2"
                        onPaste={handleOtpPaste}
                      >
                        {otp.map((digit, idx) => (
                          <input
                            key={idx}
                            id={`otp-${idx}`}
                            ref={(el) => (otpRefs.current[idx] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(e.target.value, idx)}
                            onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                            className={`h-12 w-12 rounded-xl border-2 bg-gray-50 text-center text-xl font-bold outline-none transition-all focus:bg-white ${
                              errors.otp
                                ? "border-red-400 focus:border-red-500"
                                : digit
                                ? "border-primary bg-green-50 text-primary"
                                : "border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/30"
                            }`}
                            disabled={submitting}
                            autoFocus={idx === 0}
                          />
                        ))}
                      </div>
                      {errors.otp && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-center gap-1.5 text-sm text-red-500"
                        >
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          {errors.otp}
                        </motion.p>
                      )}
                    </div>

                    <Button
                      id="btn-verify-otp"
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90"
                      size="lg"
                      disabled={submitting || otp.join("").length !== 6}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang xác thực...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Xác nhận OTP
                        </>
                      )}
                    </Button>

                    {/* Gửi lại OTP + Quay lại */}
                    <div className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
                      <span>
                        Không nhận được mã?{" "}
                        <button
                          type="button"
                          className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={handleResendOtp}
                          disabled={resending || submitting || resendCountdown > 0}
                        >
                          {resending
                            ? "Đang gửi lại..."
                            : resendCountdown > 0
                            ? `Gửi lại sau ${resendCountdown}s`
                            : "Gửi lại OTP"}
                        </button>
                      </span>
                      <button
                        type="button"
                        className="flex items-center justify-center gap-1 text-muted-foreground hover:text-foreground"
                        onClick={() => { setStep(1); setOtp(["", "", "", "", "", ""]); setErrors({}); }}
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Thay đổi email
                      </button>
                    </div>
                  </form>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}

export { ForgotPassword };
