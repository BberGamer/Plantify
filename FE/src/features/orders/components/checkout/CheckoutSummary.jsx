import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, ShieldCheck, ArrowLeft, ShoppingBag, Loader2 } from "lucide-react";

function CheckoutSummary({ handlePlaceOrder, isSubmitting, paymentMethod, remainingAmount, selectedItems, shippingFee, subtotal, walletApplied }) {
  return (
<div className="lg:col-span-1">
              <Card className="sticky top-6 border border-border shadow-sm overflow-hidden">
                <CardContent className="p-6 space-y-6">
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    Tóm tắt đơn hàng
                  </h3>

                  {/* Danh sách sản phẩm */}
                  <div className="max-h-[240px] overflow-y-auto pr-1 space-y-4">
                    {selectedItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border bg-muted">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Số lượng: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-sm text-foreground">
                            {(item.price * item.quantity).toLocaleString(
                              "vi-VN"
                            )}
                            đ
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Tính tiền */}
                  <div className="space-y-2.5 text-sm">
                     <div className="flex justify-between text-muted-foreground">
                      <span>Tạm tính</span>
                      <span className="font-medium text-foreground">
                        {subtotal.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Phí vận chuyển</span>
                      <span className="font-medium text-foreground">
                        {shippingFee.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    {walletApplied > 0 && (
                      <>
                        <div className="flex justify-between text-emerald-700">
                          <span>Thanh toán từ ví</span>
                          <span className="font-semibold">
                            -{walletApplied.toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>
                            Còn lại ({paymentMethod === "COD" ? "COD" : "VNPay"})
                          </span>
                          <span className="font-medium text-foreground">
                            {remainingAmount.toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <Separator />

                  {/* Số tiền còn phải thanh toán sau khi trừ ví */}
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-base text-foreground">
                      Thành tiền phải thanh toán
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {remainingAmount.toLocaleString("vi-VN")}đ
                    </span>
                  </div>

                  {/* Nút xác nhận đặt hàng */}
                  <Button
                    size="lg"
                    className="checkout-submit-button"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 stroke-[2.5]" />
                        Xác nhận đặt hàng
                      </>
                    )}
                  </Button>

                  {/* SSL info */}
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground bg-muted/40 py-2 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span>Kết nối bảo mật SSL & An toàn thông tin</span>
                  </div>

                  {/* Nút quay lại */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground hover:text-foreground"
                    asChild
                  >
                    <Link
                      to="/cart"
                      className="flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Quay lại giỏ hàng
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
  );
}

export { CheckoutSummary };
