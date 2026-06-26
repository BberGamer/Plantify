import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, ShieldCheck, Landmark, Banknote, CreditCard, ArrowLeft, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useAuth } from "@/features/auth/hooks";
import { getMyAddressesApi } from "@/features/auth/api";
import { getCart } from "@/features/cart/api";
import { extractCartPayload, notifyCartUpdated } from "@/features/cart/cartStorage";
import { createOrder } from "@/features/orders/api";

function Checkout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Selected items from cart
  const [selectedItems, setSelectedItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const shippingFee = 30000;
  
  // Form states
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    notes: ""
  });
  
  // Error validation states
  const [errors, setErrors] = useState({});

  // Payment method state: 'COD' or 'BANK'
  const [paymentMethod, setPaymentMethod] = useState("COD");
  
  // Checkout success state
  const [isSuccess, setIsSuccess] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  useEffect(() => {
    if (!user) return;

    setForm((prev) => ({
      ...prev,
      fullName: user.fullName || "",
      phone: user.phone || "",
      email: user.email || "",
      address: user.address || "",
    }));
  }, [user]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    async function fillDefaultAddress() {
      try {
        const response = await getMyAddressesApi();
        const addresses = response?.data || [];
        const defaultAddress = addresses.find((address) => address.isDefault);

        if (!defaultAddress) return;

        setForm((prev) => ({
          ...prev,
          fullName: defaultAddress.receiverName || prev.fullName,
          phone: defaultAddress.phone || prev.phone,
          address: defaultAddress.fullAddress || prev.address,
        }));
      } catch {
        // Khong chan checkout neu so dia chi chua tai duoc.
      }
    }

    fillDefaultAddress();
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    async function loadSelectedItems() {
      try {
        const response = await getCart();
        const cart = extractCartPayload(response).items;
        const selected = cart.filter(item => item.selected);

        setSelectedItems(selected);

        const sum = selected.reduce((total, item) => total + (item.price * item.quantity), 0);
        setSubtotal(sum);
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          navigate("/login", { state: { from: "/checkout" }, replace: true });
          return;
        }

        toast.error(error.response?.data?.message || "Không thể tải giỏ hàng.");
      }
    }

    loadSelectedItems();
  }, [authLoading, isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ và tên người nhận";
    if (!form.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^\d{10,11}$/.test(form.phone.trim().replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ (yêu cầu 10-11 chữ số)";
    }
    if (!form.email.trim()) {
      newErrors.email = "Vui lòng nhập địa chỉ email";
    } else if (!/\S+@\S+\.\S+/.test(form.email.trim())) {
      newErrors.email = "Địa chỉ email không đúng định dạng";
    }
    if (!form.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ nhận hàng";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      toast.error("Không có sản phẩm nào được chọn để thanh toán.");
      return;
    }

    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ và đúng thông tin giao hàng!");
      return;
    }

    try {
      setPlacingOrder(true);
      const response = await createOrder({
        shippingInfo: form,
        paymentMethod,
      });

      setCreatedOrder(response.data);
      setIsSuccess(true);
      notifyCartUpdated();
      toast.success("Đặt hàng thành công!");

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        navigate("/login", { state: { from: "/checkout" }, replace: true });
        return;
      }

      toast.error(error.response?.data?.message || "Không thể tạo đơn hàng.");
    } finally {
      setPlacingOrder(false);
    }
  };
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: "/checkout" }} replace />;
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/30 to-white py-16 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full border-2 border-green-100 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">Đặt hàng thành công!</h2>
            <p className="text-muted-foreground mb-6">
              Cảm ơn bạn đã mua sắm tại Plantify. Đơn hàng của bạn đang được xử lý và sẽ sớm giao tới bạn.
            </p>
            <div className="bg-muted/50 rounded-xl p-4 mb-8 text-left text-sm space-y-2">
              {createdOrder?.orderCode && <p><strong>Mã đơn:</strong> {createdOrder.orderCode}</p>}
              <p><strong>Người nhận:</strong> {form.fullName}</p>
              <p><strong>Số điện thoại:</strong> {form.phone}</p>
              <p><strong>Địa chỉ:</strong> {form.address}</p>
              <p><strong>Thanh toán:</strong> {paymentMethod === "COD" ? "Thanh toán COD khi nhận hàng" : "Chuyển khoản Internet Banking"}</p>
              <p><strong>Tổng thanh toán:</strong> {(createdOrder?.total || subtotal + shippingFee).toLocaleString("vi-VN")}đ</p>
            </div>
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-green-600 text-white rounded-xl"
              onClick={() => navigate("/marketplace")}
            >
              Tiếp tục mua sắm
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/10 to-white py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link to="/cart" className="hover:text-primary transition-colors">Giỏ hàng</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Thanh toán</span>
        </div>

        {/* Title */}
        <div className="flex items-center gap-3 mb-8">
          <CreditCard className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Thanh toán đơn hàng</h1>
        </div>

        {selectedItems.length === 0 ? (
          <Card className="p-8 text-center max-w-lg mx-auto">
            <CardContent className="space-y-4">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto" />
              <h3 className="text-xl font-semibold">Không có sản phẩm để thanh toán</h3>
              <p className="text-muted-foreground">Vui lòng quay lại giỏ hàng và chọn sản phẩm cần thanh toán.</p>
              <Button asChild>
                <Link to="/cart">Quay lại giỏ hàng</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Form & Payment Method */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Section 1: Shipping Information */}
              <Card className="border border-border shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                      1
                    </span>
                    <h2 className="text-lg font-semibold">Thông tin giao hàng</h2>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Họ và tên <span className="text-red-500">*</span></label>
                    <Input
                      name="fullName"
                      placeholder="Nhập họ và tên người nhận..."
                      value={form.fullName}
                      onChange={handleInputChange}
                      className={errors.fullName ? "border-destructive text-black" : "text-black"}
                    />
                    {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Số điện thoại <span className="text-red-500">*</span></label>
                      <Input
                        name="phone"
                        placeholder="Nhập số điện thoại..."
                        value={form.phone}
                        onChange={handleInputChange}
                        className={errors.phone ? "border-destructive text-black" : "text-black"}
                      />
                      {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="Nhập địa chỉ email..."
                        value={form.email}
                        onChange={handleInputChange}
                        className={errors.email ? "border-destructive text-black" : "text-black"}
                      />
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Địa chỉ nhận hàng <span className="text-red-500">*</span></label>
                    <Input
                      name="address"
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..."
                      value={form.address}
                      onChange={handleInputChange}
                      className={errors.address ? "border-destructive text-black" : "text-black"}
                    />
                    {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ghi chú đơn hàng</label>
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

              {/* Section 2: Payment Method */}
              <Card className="border border-border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                      2
                    </span>
                    <h2 className="text-lg font-semibold">Phương thức thanh toán</h2>
                  </div>

                  <div className="space-y-4">
                    {/* Option 1: COD */}
                    <div
                      onClick={() => setPaymentMethod("COD")}
                      className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "COD" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}
                    >
                      <div className="pt-1">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "COD" ? "border-primary" : "border-muted-foreground"}`}>
                          {paymentMethod === "COD" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                        <Banknote className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Thanh toán khi nhận hàng (COD)</h4>
                        <p className="text-sm text-muted-foreground mt-0.5">Thanh toán bằng tiền mặt khi shipper giao hàng tận nơi</p>
                      </div>
                    </div>

                    {/* Option 2: Internet Banking */}
                    <div
                      onClick={() => setPaymentMethod("BANK")}
                      className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "BANK" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}
                    >
                      <div className="pt-1">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "BANK" ? "border-primary" : "border-muted-foreground"}`}>
                          {paymentMethod === "BANK" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <Landmark className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Chuyển khoản ngân hàng (Internet Banking)</h4>
                        <p className="text-sm text-muted-foreground mt-0.5">Chuyển khoản qua mã QR hoặc số tài khoản để đơn hàng được duyệt nhanh hơn</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6 border border-border shadow-sm overflow-hidden">
                <CardContent className="p-6 space-y-6">
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    Tóm tắt đơn hàng
                  </h3>

                  {/* Product items list */}
                  <div className="max-h-[240px] overflow-y-auto pr-1 space-y-4">
                    {selectedItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border bg-muted">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground truncate">{item.name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">Số lượng: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-sm text-foreground">
                            {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Calculations */}
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tạm tính</span>
                      <span className="font-medium text-foreground">{subtotal.toLocaleString("vi-VN")}đ</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Phí vận chuyển</span>
                      <span className="font-medium text-foreground">{shippingFee.toLocaleString("vi-VN")}đ</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Total summary */}
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-base text-foreground">Tổng cộng</span>
                    <span className="text-2xl font-bold text-primary">
                      {(subtotal + shippingFee).toLocaleString("vi-VN")}đ
                    </span>
                  </div>

                  {/* Button confirm order */}
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-green-600 text-white rounded-xl py-6 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-green-600/10 hover:shadow-green-600/25 transition-all"
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                  >
                    <Check className="w-5 h-5 stroke-[2.5]" />
                    {placingOrder ? "Đang tạo đơn..." : "Xác nhận đặt hàng"}
                  </Button>

                  {/* SSL info */}
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground bg-muted/40 py-2 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span>Kết nối bảo mật SSL & An toàn thông tin</span>
                  </div>

                  {/* Back button */}
                  <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground" asChild>
                    <Link to="/cart" className="flex items-center justify-center gap-2">
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
