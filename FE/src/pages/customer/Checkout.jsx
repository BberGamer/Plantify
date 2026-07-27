// Checkout.jsx - Trang thanh toán đơn hàng (hỗ trợ COD + VNPay)
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { useCheckout } from "@/features/orders/hooks";

function Checkout() {
  const navigate = useNavigate();
  const {
    authLoading,
    checkoutTotal,
    errors,
    form,
    handleInputChange,
    handlePlaceOrder,
    isFailed,
    isLoadingCart,
    isProcessing,
    isSubmitting,
    isSuccess,
    orderCode,
    orderTotal,
    paymentMethod,
    remainingAmount,
    retryPayment,
    selectedItems,
    setPaymentMethod,
    setUseWallet,
    shippingFee,
    subtotal,
    useWallet,
    walletApplied,
    walletBalance,
  } = useCheckout();

  // ========================================
  // RENDER
  // ========================================

  // === ĐANG TẢI THÔNG TIN HỆ THỐNG ===
  if ((authLoading || isLoadingCart) && !isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/30 to-white py-16 px-4 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  // === ĐANG XÁC THỰC THANH TOÁN VNPAY ===
  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/30 to-white py-16 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full border-2 border-green-100 shadow-xl">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Đang xác thực thanh toán...
            </h2>
            <p className="text-muted-foreground">
              Vui lòng đợi trong giây lát, hệ thống đang xác thực giao dịch với
              VNPay.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // === THANH TOÁN THẤT BẠI ===
  if (isFailed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/30 to-white py-16 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full border-2 border-red-100 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 stroke-[3]" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Thanh toán thất bại!
            </h2>
            <p className="text-muted-foreground mb-6">
              Giao dịch thanh toán không thành công hoặc đã bị hủy. Sản phẩm
              vẫn được giữ trong giỏ hàng của bạn.
            </p>
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-green-600 text-white rounded-xl"
                onClick={retryPayment}
              >
                Thử thanh toán lại
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-xl"
                onClick={() => navigate("/cart")}
              >
                Quay lại giỏ hàng
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // === ĐẶT HÀNG THÀNH CÔNG ===
  if (isSuccess) {
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

  // === FORM CHECKOUT ===
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/10 to-white py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <Link to="/cart" className="hover:text-primary transition-colors">
            Giỏ hàng
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Thanh toán</span>
        </div>

        {/* Title */}
        <div className="flex items-center gap-3 mb-8">
          <CreditCard className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">
            Thanh toán đơn hàng
          </h1>
        </div>

        {selectedItems.length === 0 ? (
          <Card className="p-8 text-center max-w-lg mx-auto">
            <CardContent className="space-y-4">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto" />
              <h3 className="text-xl font-semibold">
                Không có sản phẩm để thanh toán
              </h3>
              <p className="text-muted-foreground">
                Vui lòng quay lại giỏ hàng và chọn sản phẩm cần thanh toán.
              </p>
              <Button asChild>
                <Link to="/cart">Quay lại giỏ hàng</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cột trái: Form thông tin + Phương thức thanh toán */}
            <div className="lg:col-span-2 space-y-6">
              {/* Section 1: Thông tin giao hàng */}
              <Card className="border border-border shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                     <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                      1
                    </span>
                    <h2 className="text-lg font-semibold">
                      Thông tin giao hàng
                    </h2>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="fullName"
                      placeholder="Nhập họ và tên người nhận..."
                      value={form.fullName}
                      onChange={handleInputChange}
                      className={
                        errors.fullName
                          ? "border-destructive text-black"
                          : "text-black"
                      }
                    />
                    {errors.fullName && (
                      <p className="text-xs text-destructive">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="phone"
                        placeholder="Nhập số điện thoại..."
                        value={form.phone}
                        onChange={handleInputChange}
                        className={
                          errors.phone
                            ? "border-destructive text-black"
                            : "text-black"
                        }
                      />
                      {errors.phone && (
                        <p className="text-xs text-destructive">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="Nhập địa chỉ email..."
                        value={form.email}
                        onChange={handleInputChange}
                        className={
                          errors.email
                            ? "border-destructive text-black"
                            : "text-black"
                        }
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Địa chỉ nhận hàng{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="address"
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..."
                      value={form.address}
                      onChange={handleInputChange}
                      className={
                        errors.address
                          ? "border-destructive text-black"
                          : "text-black"
                      }
                    />
                    {errors.address && (
                      <p className="text-xs text-destructive">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Ghi chú đơn hàng
                    </label>
                    <Textarea
                      name="notes"
                      placeholder="Lưu ý cho shipper, thời gian nhận hàng mong muốn..."
                      value={form.notes}
                      onChange={handleInputChange}
                      className="min-h-[100px] text-black"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Section 2: Phương thức thanh toán */}
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
            </div>

            {/* Cột phải: Tóm tắt đơn hàng */}
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
                    className="w-full bg-gradient-to-r from-primary to-green-600 text-white rounded-xl py-6 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-green-600/10 hover:shadow-green-600/25 transition-all"
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
          </div>
        )}
      </div>
    </div>
  );
}

export { Checkout };
