// ResetPassword.jsx - Trang đặt lại mật khẩu mới sau khi OTP đã được xác thực
import { useState, useEffect } from "react";
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
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { resetPasswordApi } from "@/features/auth/api";
import { toast } from "sonner";

/**
 * Tính độ mạnh mật khẩu
 * @param {string} password
 */
const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { level: score, label: "Yếu", color: "bg-red-500" };
  if (score === 3) return { level: score, label: "Trung bình", color: "bg-amber-500" };
  if (score === 4) return { level: score, label: "Mạnh", color: "bg-blue-500" };
  return { level: score, label: "Rất mạnh", color: "bg-green-500" };
};

/**
 * Danh sách điều kiện bảo mật mật khẩu
 */
const PasswordRequirements = ({ password }) => {
  const reqs = [
    { label: "Ít nhất 8 ký tự", met: password.length >= 8 },
    { label: "Ít nhất 1 chữ hoa (A-Z)", met: /[A-Z]/.test(password) },
    { label: "Ít nhất 1 chữ thường (a-z)", met: /[a-z]/.test(password) },
    { label: "Ít nhất 1 chữ số (0-9)", met: /[0-9]/.test(password) },
  ];
  return (
    <ul className="mt-2 space-y-1">
      {reqs.map((r) => (
        <li
          key={r.label}
          className={`flex items-center gap-1.5 text-xs transition-colors ${r.met ? "text-green-600" : "text-muted-foreground"}`}
        >
          {r.met ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
          ) : (
            <XCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
          )}
          {r.label}
        </li>
      ))}
    </ul>
  );
};

function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [countdown, setCountdown] = useState(5);

  const strength = getPasswordStrength(password);

  // Đọc email + otp từ sessionStorage (đã được set ở trang ForgotPassword sau verify)
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("otp_email");
    const storedOtp = sessionStorage.getItem("otp_code");
    if (!storedEmail || !storedOtp) {
      // Không có thông tin OTP — chuyển hướng về forgot-password
      toast.error("Phiên xác thực không hợp lệ. Vui lòng bắt đầu lại.");
      navigate("/forgot-password", { replace: true });
    } else {
      setEmail(storedEmail);
      setOtpCode(storedOtp);
    }
  }, [navigate]);

  // Đếm ngược redirect về login sau khi thành công
  useEffect(() => {
    if (!success) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/login", { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [success, navigate]);

  const validate = () => {
    const errs = {};
    if (!password) {
      errs.password = "Mật khẩu mới là bắt buộc";
    } else if (password.length < 8) {
      errs.password = "Mật khẩu phải có tối thiểu 8 ký tự";
    } else if (!/[A-Z]/.test(password)) {
      errs.password = "Mật khẩu phải chứa ít nhất 1 chữ hoa";
    } else if (!/[a-z]/.test(password)) {
      errs.password = "Mật khẩu phải chứa ít nhất 1 chữ thường";
    } else if (!/[0-9]/.test(password)) {
      errs.password = "Mật khẩu phải chứa ít nhất 1 chữ số";
    }

    if (!confirmPassword) {
      errs.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (password !== confirmPassword) {
      errs.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await resetPasswordApi(email, otpCode, password, confirmPassword);
      // Xóa sessionStorage sau khi đổi mật khẩu thành công
      sessionStorage.removeItem("otp_email");
      sessionStorage.removeItem("otp_code");
      setSuccess(true);
      toast.success("Đặt lại mật khẩu thành công!");
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Đã có lỗi xảy ra.";
      toast.error(msg);
      // Nếu OTP đã hết hạn — đẩy về lại forgot-password
      if (msg.includes("hết hạn") || msg.includes("không tồn tại")) {
        sessionStorage.removeItem("otp_email");
        sessionStorage.removeItem("otp_code");
        setTimeout(() => navigate("/forgot-password"), 2000);
      }
      setErrors({ general: msg });
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

        <Card className="border-2 border-green-100 bg-white/95 shadow-2xl backdrop-blur-sm">
          <AnimatePresence mode="wait">
            {/* Trạng thái đổi mật khẩu thành công */}
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader className="space-y-1 pb-2">
                  <div className="flex justify-center pb-2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
                    >
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </motion.div>
                  </div>
                  <CardTitle className="text-center text-2xl">Đặt lại thành công!</CardTitle>
                  <CardDescription className="text-center">
                    Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập ngay bây giờ.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-4 text-center">
                    <p className="text-sm text-green-700">
                      Tự động chuyển hướng về trang đăng nhập sau{" "}
                      <span className="font-bold text-green-800 text-base">{countdown}</span> giây...
                    </p>
                  </div>
                  <Button
                    id="btn-go-login"
                    className="w-full bg-gradient-to-r from-primary to-green-600"
                    size="lg"
                    onClick={() => navigate("/login")}
                  >
                    Đăng nhập ngay
                  </Button>
                </CardContent>
              </motion.div>
            ) : (
              /* Form đặt lại mật khẩu mới */
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader className="space-y-1">
                  <div className="flex justify-center pb-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <ShieldCheck className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <CardTitle className="text-center text-2xl">Đặt mật khẩu mới</CardTitle>
                  <CardDescription className="text-center">
                    Tạo mật khẩu mạnh để bảo vệ tài khoản của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Lỗi chung */}
                  {errors.general && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3"
                    >
                      <p className="flex items-center gap-2 text-sm text-red-700">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {errors.general}
                      </p>
                    </motion.div>
                  )}

                  <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                    {/* Mật khẩu mới */}
                    <div className="space-y-2">
                      <Label htmlFor="password">Mật khẩu mới</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                          }}
                          onFocus={() => setShowRequirements(true)}
                          className={`pl-10 pr-10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          disabled={submitting}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Password strength bar */}
                      {password && (
                        <div className="space-y-1.5">
                          <div className="flex h-1.5 gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div
                                key={i}
                                className={`h-full flex-1 rounded-full transition-all duration-300 ${i <= strength.level ? strength.color : "bg-gray-200"}`}
                              />
                            ))}
                          </div>
                          <p className={`text-xs font-medium ${
                            strength.level <= 2 ? "text-red-500" :
                            strength.level === 3 ? "text-amber-500" :
                            strength.level === 4 ? "text-blue-500" : "text-green-600"
                          }`}>
                            Độ mạnh: {strength.label}
                          </p>
                        </div>
                      )}

                      {/* Requirements checklist */}
                      <AnimatePresence>
                        {showRequirements && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <PasswordRequirements password={password} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {errors.password && (
                        <p className="flex items-center gap-1.5 text-sm text-red-500">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          {errors.password}
                        </p>
                      )}
                    </div>

                    {/* Xác nhận mật khẩu mới */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirm ? "text" : "password"}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                          }}
                          className={`pl-10 pr-10 ${
                            errors.confirmPassword
                              ? "border-red-500 focus-visible:ring-red-500"
                              : confirmPassword && confirmPassword === password
                              ? "border-green-500 focus-visible:ring-green-500"
                              : ""
                          }`}
                          disabled={submitting}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                          tabIndex={-1}
                        >
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {confirmPassword && confirmPassword === password && (
                        <p className="flex items-center gap-1.5 text-sm text-green-600">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          Mật khẩu khớp
                        </p>
                      )}
                      {errors.confirmPassword && (
                        <p className="flex items-center gap-1.5 text-sm text-red-500">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <Button
                      id="btn-reset-password"
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90"
                      size="lg"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang cập nhật mật khẩu...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Đặt lại mật khẩu
                        </>
                      )}
                    </Button>

                    <Button type="button" variant="ghost" className="w-full" asChild>
                      <Link to="/login">Quay lại đăng nhập</Link>
                    </Button>
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

export { ResetPassword };
