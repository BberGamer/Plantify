// Register.jsx - Trang đăng ký: điền thông tin → gửi OTP → chuyển sang trang xác thực
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Mail, Lock, User, Phone, MapPin, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { sendRegisterOtpApi } from "@/features/auth/api";

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validateForm = () => {
    const { fullName, email, password, confirmPassword, phone } = formData;
    const newErrors = {};

    if (!fullName || !fullName.trim()) newErrors.fullName = "Họ và tên là bắt buộc";
    if (!email || !email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[a-zA-Z0-9._%+\-]+@(gmail\.com|yahoo\.com|fpt\.edu\.vn)$/i.test(email.trim())) {
      newErrors.email = "Email không đúng định dạng";
    }

    if (phone && phone.trim() !== "") {
      if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(phone.trim())) {
        newErrors.phone = "Số điện thoại không hợp lệ (bắt đầu 03/05/07/08/09, 10 chữ số)";
      }
    }

    if (!password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (password.length < 8) {
      newErrors.password = "Mật khẩu phải chứa tối thiểu 8 ký tự";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không trùng khớp";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await sendRegisterOtpApi({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
      });
      toast.success("Mã OTP 6 số đã được gửi đến Gmail của bạn!");
      // Chỉ navigate sau khi gửi email thành công
      navigate("/register/verify-otp", {
        state: { email: formData.email.trim() }
      });
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Đã có lỗi xảy ra.";
      const lower = msg.toLowerCase();
      // Chỉ map vào email field khi đúng là lỗi email trùng hay không hợp lệ
      if (lower.includes("email đã") || lower.includes("email không hợp lệ")) {
        setErrors({ email: msg });
      } else if (lower.includes("điện thoại") || lower.includes("phone") || lower.includes("số điện")) {
        setErrors({ phone: msg });
      } else {
        // Lỗi SMTP / server -> hiện toast, không điền vào field
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

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

        {/* Step indicator — Step 1 active */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold bg-primary text-white">1</div>
          <div className="h-1 w-14 rounded-full bg-gray-200" />
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold bg-gray-100 text-gray-400">2</div>
        </div>

        <Card className="border-2 border-green-100 shadow-2xl backdrop-blur-sm bg-white/95">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Đăng ký</CardTitle>
            <CardDescription className="text-center">
              Tạo tài khoản để bắt đầu hành trình với Plantify
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>

              {/* Họ tên */}
              <div className="space-y-1">
                <Label htmlFor="fullName">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`pl-10 ${errors.fullName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    disabled={submitting}
                  />
                </div>
                {errors.fullName && (
                  <p className="flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3 w-3" />{errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    disabled={submitting}
                  />
                </div>
                {errors.email && (
                  <p className="flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3 w-3" />{errors.email}
                  </p>
                )}
              </div>

              {/* Số điện thoại */}
              <div className="space-y-1">
                <Label htmlFor="phone">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="0xxx xxx xxx"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`pl-10 ${errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    disabled={submitting}
                  />
                </div>
                {errors.phone && (
                  <p className="flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3 w-3" />{errors.phone}
                  </p>
                )}
              </div>

              {/* Địa chỉ */}
              <div className="space-y-1">
                <Label htmlFor="address">Địa chỉ nhà</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="123 Đường ABC, Quận X, TP.HCM"
                    value={formData.address}
                    onChange={handleChange}
                    className="pl-10"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Mật khẩu */}
              <div className="space-y-1">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 pr-10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3 w-3" />{errors.password}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Tối thiểu 8 ký tự</p>
                )}
              </div>

              {/* Xác nhận mật khẩu */}
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3 w-3" />{errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-green-600"
                size="lg"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang gửi mã xác thực...
                  </>
                ) : (
                  "Đăng ký"
                )}
              </Button>

              <div className="mt-4 text-center text-sm">
                Đã có tài khoản?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Đăng nhập
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export { Register };
