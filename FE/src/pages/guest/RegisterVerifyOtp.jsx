// RegisterVerifyOtp.jsx - Trang xác thực OTP đăng ký (bước 2)
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Leaf, Loader2, ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { sendRegisterOtpApi, verifyRegisterOtpApi } from "@/features/auth/api";

function RegisterVerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy email từ state truyền qua navigate
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(20);
  const [errors, setErrors] = useState({});

  const otpRefs = useRef([]);

  // Nếu không có email (truy cập trực tiếp URL) thì redirect về /register
  useEffect(() => {
    if (!email) {
      toast.error("Vui lòng thực hiện đăng ký trước.");
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  // Đếm ngược gửi lại OTP
  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setInterval(() => setResendCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // ------- OTP input handlers -------
  const handleOtpChange = (value, idx) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[idx] = value;
    setOtp(next);
    if (errors.otp) setErrors({});
    if (value !== "" && idx < 5) otpRefs.current[idx + 1]?.focus();
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

  // ------- Xác thực OTP -------
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
      await verifyRegisterOtpApi(email, fullOtp);
      toast.success("Đăng ký tài khoản thành công! Hãy đăng nhập.");
      navigate("/login");
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Xác thực OTP thất bại.";
      toast.error(msg);
      setErrors({ otp: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // ------- Gửi lại OTP -------
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || !location.state) return;
    setResending(true);
    try {
      // Gọi lại API send-otp với toàn bộ thông tin từ state
      await sendRegisterOtpApi(location.state);
      setOtp(["", "", "", "", "", ""]);
      setErrors({});
      setResendCountdown(20);
      otpRefs.current[0]?.focus();
      toast.success("Đã gửi lại mã OTP mới!");
    } catch (error) {
      toast.error("Gửi lại OTP thất bại. Vui lòng thử lại.");
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1604762524889-3e2fcc145683?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920"
          alt="Plant background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-green-50/95 to-white/95" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(45,106,79,0.08),transparent_60%)] z-0" />
      <motion.div
        className="absolute bottom-20 left-20 w-32 h-32 rounded-full bg-primary/10 blur-3xl"
        animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-br from-primary to-green-700 bg-clip-text text-transparent">
              Plantify
            </span>
          </Link>
        </div>

        {/* Step indicator — Step 2 active */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold bg-primary/30 text-primary">1</div>
          <div className="h-1 w-14 rounded-full bg-primary transition-colors duration-300" />
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold bg-primary text-white">2</div>
        </div>

        <Card className="border-2 border-green-100 shadow-2xl backdrop-blur-sm bg-white/95">
          <CardHeader className="space-y-1">
            <div className="flex justify-center pb-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <ShieldCheck className="h-7 w-7 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Xác thực Email</CardTitle>
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
                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`register-otp-${idx}`}
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
                id="btn-register-verify-otp"
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
                    Xác nhận & Tạo tài khoản
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
                  className="flex items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => navigate("/register")}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Quay lại chỉnh sửa thông tin
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export { RegisterVerifyOtp };
