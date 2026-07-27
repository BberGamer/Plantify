// ForgotPassword.jsx - Trang quên mật khẩu: nhập email nhận OTP và xác thực OTP 6 số
import { Link } from "react-router";




import { Leaf } from "lucide-react";
import { motion } from "motion/react";
import { useForgotPasswordFlow } from "@/features/auth/hooks";
import { ForgotPasswordFlowCard } from "@/features/auth/components/forgot-password/ForgotPasswordFlowCard";

function ForgotPassword() {
  const {
    changeEmail,
    email,
    errors,
    handleEmailChange,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    handleResendOtp,
    handleSendOtp,
    handleVerifyOtp,
    otp,
    otpRefs,
    resendCountdown,
    resending,
    step,
    submitting,
  } = useForgotPasswordFlow();

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
            <div
              className="
                flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br
                from-primary to-green-600 shadow-lg transition-transform group-hover:scale-110
              "
            >
              <Leaf className="h-8 w-8 text-white" />
            </div>
            <span className="bg-gradient-to-br from-primary to-green-700 bg-clip-text text-3xl font-bold text-transparent">
              Plantify
            </span>
          </Link>
        </div>

        {/* Step indicator */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
              step >= 1
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            1
          </div>
          <div className={`h-1 w-12 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-gray-200"}`} />
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
              step >= 2
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            2
          </div>
        </div>

        <ForgotPasswordFlowCard
          changeEmail={changeEmail}
          email={email}
          errors={errors}
          handleEmailChange={handleEmailChange}
          handleOtpChange={handleOtpChange}
          handleOtpKeyDown={handleOtpKeyDown}
          handleOtpPaste={handleOtpPaste}
          handleResendOtp={handleResendOtp}
          handleSendOtp={handleSendOtp}
          handleVerifyOtp={handleVerifyOtp}
          otp={otp}
          otpRefs={otpRefs}
          resendCountdown={resendCountdown}
          resending={resending}
          step={step}
          submitting={submitting}
        />
      </motion.div>
    </div>
  );
}

export { ForgotPassword };
