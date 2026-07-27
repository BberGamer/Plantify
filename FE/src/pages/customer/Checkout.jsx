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
import { CheckoutSuccessView } from "@/features/orders/components/checkout/CheckoutSuccessView";
import { CheckoutShippingSection } from "@/features/orders/components/checkout/CheckoutShippingSection";
import { CheckoutPaymentSection } from "@/features/orders/components/checkout/CheckoutPaymentSection";
import { CheckoutSummary } from "@/features/orders/components/checkout/CheckoutSummary";

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
      <CheckoutSuccessView form={form} navigate={navigate} orderCode={orderCode} orderTotal={orderTotal} paymentMethod={paymentMethod} remainingAmount={remainingAmount} />
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
              <CheckoutShippingSection errors={errors} form={form} handleInputChange={handleInputChange} />

              {/* Section 2: Phương thức thanh toán */}
              <CheckoutPaymentSection paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} setUseWallet={setUseWallet} useWallet={useWallet} walletBalance={walletBalance} />
            </div>

            {/* Cột phải: Tóm tắt đơn hàng */}
            <CheckoutSummary handlePlaceOrder={handlePlaceOrder} isSubmitting={isSubmitting} paymentMethod={paymentMethod} remainingAmount={remainingAmount} selectedItems={selectedItems} shippingFee={shippingFee} subtotal={subtotal} walletApplied={walletApplied} />
          </div>
        )}
      </div>
    </div>
  );
}

export { Checkout };
