import { Link } from "react-router";
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
import { Mail, ArrowLeft, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function ForgotPasswordFlowCard({
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
}) {
  return (
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
                          onChange={(e) => handleEmailChange(e.target.value)}
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
                        onClick={changeEmail}
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
  );
}

export { ForgotPasswordFlowCard };
