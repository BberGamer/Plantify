// ResetPasswordForm.jsx - Hiển thị biểu mẫu đặt lại mật khẩu sau khi xác thực OTP
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function ResetPasswordForm({
  PasswordRequirements,
  changeConfirmPassword,
  changePassword,
  confirmPassword,
  errors,
  handleSubmit,
  password,
  setShowConfirm,
  setShowPassword,
  setShowRequirements,
  showConfirm,
  showPassword,
  showRequirements,
  strength,
  submitting,
}) {
  return (
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
                          onChange={(e) => changePassword(e.target.value)}
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
                          onChange={(e) => changeConfirmPassword(e.target.value)}
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
  );
}

export { ResetPasswordForm };
