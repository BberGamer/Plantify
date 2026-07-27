// CheckoutSuccessView.jsx - Hiển thị kết quả đặt hàng thành công và hướng dẫn tiếp theo
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

function CheckoutSuccessView({ form, navigate, orderCode, orderTotal, paymentMethod, remainingAmount }) {
  return (
<div className="min-h-screen bg-gradient-to-br from-green-50/30 to-white py-16 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full border-2 border-green-100 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Đặt hàng thành công!
            </h2>
            <p className="text-muted-foreground mb-6">
              Cảm ơn bạn đã mua sắm tại Plantify. Đơn hàng của bạn đang được
              xử lý và sẽ sớm giao tới bạn.
            </p>
            <div className="bg-muted/50 rounded-xl p-4 mb-8 text-left text-sm space-y-2">
              {orderCode && (
                <p>
                  <strong>Mã đơn:</strong> {orderCode}
                </p>
              )}
              <p>
                <strong>Người nhận:</strong> {form.fullName}
              </p>
              <p>
                <strong>Số điện thoại:</strong> {form.phone}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {form.address}
              </p>
              <p>
                <strong>Thanh toán:</strong>{" "}
                {paymentMethod === "COD"
                  ? "Thanh toán COD khi nhận hàng"
                  : "Chuyển khoản Internet Banking"}
              </p>
              <p>
                <strong>Thành tiền phải thanh toán:</strong>{" "}
                {(orderTotal ?? remainingAmount).toLocaleString("vi-VN")}đ
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-xl border-primary text-primary hover:bg-primary/5"
                onClick={() => navigate("/marketplace")}
              >
                {"Ti\u1ebfp t\u1ee5c mua s\u1eafm"}
              </Button>
              <Button
                size="lg"
                className="w-full rounded-xl bg-gradient-to-r from-primary to-green-600 text-white"
                onClick={() => navigate("/profile?tab=orders")}
              >
                {"L\u1ecbch s\u1eed \u0111\u01a1n h\u00e0ng"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}

export { CheckoutSuccessView };
