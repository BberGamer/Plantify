import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  ShieldCheck,
  Landmark,
  Banknote,
  CreditCard,
  ArrowLeft,
  ShoppingBag,
  Loader2,
  XCircle,
  Wallet,
} from "lucide-react";

function CheckoutPaymentSection({ paymentMethod, setPaymentMethod, setUseWallet, useWallet, walletBalance }) {
  return (
<Card className="border border-border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                      2
                    </span>
                    <h2 className="text-lg font-semibold">
                      Phương thức thanh toán
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                          <Wallet className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">Ví Plantify</h4>
                          <p className="text-sm text-muted-foreground">
                            Số dư: {walletBalance.toLocaleString("vi-VN")}đ
                          </p>
                        </div>
                      </div>
                      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                        <input
                          type="checkbox"
                          checked={useWallet}
                          disabled={walletBalance <= 0}
                          onChange={(event) => setUseWallet(event.target.checked)}
                          className="h-4 w-4 accent-emerald-600"
                        />
                        Sử dụng ví
                      </label>
                    </div>

                    {/* Option 1: COD */}
                    <div
                      onClick={() => setPaymentMethod("COD")}
                      className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                        paymentMethod === "COD"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="pt-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === "COD"
                              ? "border-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {paymentMethod === "COD" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                        <Banknote className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          Thanh toán khi nhận hàng (COD)
                        </h4>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Thanh toán bằng tiền mặt khi shipper giao hàng tận nơi
                        </p>
                      </div>
                    </div>

                    {/* Option 2: VNPay */}
                    <div
                      onClick={() => setPaymentMethod("BANK")}
                      className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                        paymentMethod === "BANK"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="pt-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === "BANK"
                              ? "border-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {paymentMethod === "BANK" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <Landmark className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          Chuyển khoản ngân hàng (Internet Banking)
                        </h4>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Thanh toán qua cổng VNPay - hỗ trợ QR, ATM, Visa,
                          MasterCard
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
  );
}

export { CheckoutPaymentSection };
