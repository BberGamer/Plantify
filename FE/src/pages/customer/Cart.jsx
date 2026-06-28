import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, CheckCircle2, FileText, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { EmptyState } from "@/components/common/EmptyState";
import { useAuth } from "@/features/auth/hooks";
import { getCart, removeCartItem, updateCartItem } from "@/features/cart/api";
import { extractCartPayload, normalizeCartItems, notifyCartUpdated, readLocalCart, writeLocalCart } from "@/features/cart/cartStorage";
import { toast } from "sonner";

const CART_TERMS = [
  "Khách hàng cung cấp đầy đủ và chính xác thông tin khi đặt hàng.",
  "Đơn hàng chỉ được xác nhận sau khi hệ thống hoặc nhân viên xác nhận.",
  "Giá sản phẩm là giá hiển thị tại thời điểm đặt hàng.",
  "Khách hàng có trách nhiệm thanh toán đầy đủ theo phương thức đã chọn.",
  "Đơn hàng có thể bị hủy nếu phát hiện thông tin không chính xác hoặc vi phạm chính sách của cửa hàng.",
  "Trường hợp hoàn tiền vui lòng liên hệ riêng với chúng tôi cung cấp thông tin để được hoàn tiền.",
];

function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState(() => readLocalCart());
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState("");
  const [termsOpen, setTermsOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setCartItems(readLocalCart());
      return;
    }

    async function loadCart() {
      setCartLoading(true);
      setCartError("");
      try {
        const response = await getCart();
        const cart = extractCartPayload(response);
        setCartItems(cart.items);
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          navigate("/login", { state: { from: "/cart" }, replace: true });
          return;
        }

        const message = error.response?.data?.message || "Không thể tải giỏ hàng.";
        setCartError(message);
        toast.error(message);
      } finally {
        setCartLoading(false);
      }
    }

    loadCart();
  }, [authLoading, isAuthenticated, navigate]);

  const updateQuantity = async (id, delta) => {
    const nextItems = cartItems.map((item) => (
      item.id === id
        ? {
            ...item,
            quantity: Math.max(1, Math.min(item.stock, item.quantity + delta))
          }
        : item
    ));

    setCartItems(nextItems);

    if (!isAuthenticated) {
      writeLocalCart(nextItems);
      return;
    }

    const nextItem = nextItems.find((item) => item.id === id);
    try {
      const response = await updateCartItem(id, { quantity: nextItem.quantity });
      setCartItems(extractCartPayload(response).items || normalizeCartItems(nextItems));
      notifyCartUpdated();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể cập nhật giỏ hàng.");
    }
  };

  const toggleSelect = async (id) => {
    const nextItems = cartItems.map((item) => (
      item.id === id ? { ...item, selected: !item.selected } : item
    ));

    setCartItems(nextItems);

    if (!isAuthenticated) {
      writeLocalCart(nextItems);
      return;
    }

    const nextItem = nextItems.find((item) => item.id === id);
    try {
      const response = await updateCartItem(id, { selected: nextItem.selected });
      setCartItems(extractCartPayload(response).items || normalizeCartItems(nextItems));
      notifyCartUpdated();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể cập nhật giỏ hàng.");
    }
  };

  const toggleSelectAll = async () => {
    const allSelected = cartItems.every((item) => item.selected);
    const nextItems = cartItems.map((item) => ({ ...item, selected: !allSelected }));

    setCartItems(nextItems);

    if (!isAuthenticated) {
      writeLocalCart(nextItems);
      return;
    }

    try {
      const responses = await Promise.all(
        nextItems.map((item) => updateCartItem(item.id, { selected: item.selected }))
      );
      const lastResponse = responses[responses.length - 1];
      setCartItems(extractCartPayload(lastResponse).items || normalizeCartItems(nextItems));
      notifyCartUpdated();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể cập nhật giỏ hàng.");
    }
  };

  const removeItem = async (id) => {
    const nextItems = cartItems.filter((item) => item.id !== id);
    setCartItems(nextItems);

    if (!isAuthenticated) {
      writeLocalCart(nextItems);
      return;
    }

    try {
      const response = await removeCartItem(id);
      setCartItems(extractCartPayload(response).items || normalizeCartItems(nextItems));
      notifyCartUpdated();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa sản phẩm.");
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thanh toán.");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    navigate("/checkout");
  };

  const selectedItems = cartItems.filter((item) => item.selected);
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 0 ? 30000 : 0;
  const total = subtotal + shipping;

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/30 to-white py-12 px-4 flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/30 to-white py-12 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Không thể tải giỏ hàng</h2>
            <p className="text-muted-foreground mb-4">{cartError}</p>
            <Button onClick={() => window.location.reload()}>Tải lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/30 to-white py-12 px-4 flex items-center justify-center">
        <EmptyState
          icon={ShoppingBag}
          title="Giỏ hàng trống"
          description="Bạn chưa thêm sản phẩm nào vào giỏ hàng"
          action={{
            label: "Khám phá sản phẩm",
            onClick: () => navigate("/marketplace")
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 to-white py-12 px-4">
      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="overflow-hidden border-0 p-0 shadow-2xl sm:max-w-2xl">
          <div className="bg-gradient-to-r from-primary via-green-600 to-emerald-500 px-6 py-6 text-white">
            <DialogHeader className="gap-4 text-left">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-inner">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold leading-tight">
                    Điều khoản mua sắm
                  </DialogTitle>
                  <DialogDescription className="mt-2 text-sm leading-6 text-white/90">
                    Vui lòng đọc các điều khoản trước khi tiếp tục thanh toán tại Plantify.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="space-y-5 px-6 py-5">
            <div className="flex gap-3 rounded-lg border border-green-100 bg-green-50/80 p-4 text-sm text-green-900">
              <FileText className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <p>
                Các điều khoản này giúp Plantify xử lý đơn hàng rõ ràng, minh bạch và đúng thông tin khách hàng cung cấp.
              </p>
            </div>

            <ol className="grid gap-3">
              {CART_TERMS.map((term, index) => (
                <li
                  key={term}
                  className="flex gap-3 rounded-lg border border-border bg-white p-3 text-sm leading-6 shadow-sm"
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="text-foreground">{term}</span>
                </li>
              ))}
            </ol>
          </div>

          <DialogFooter className="border-t bg-muted/40 px-6 py-4 sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Bạn có thể đóng thông báo này bằng nút X để quay lại giỏ hàng.
            </p>
            <DialogClose asChild>
              <Button className="gap-2 bg-gradient-to-r from-primary to-green-600 text-white">
                <CheckCircle2 className="h-4 w-4" />
                Tôi đã hiểu
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Giỏ hàng</h1>
          <p className="text-muted-foreground">
            Bạn có {cartItems.length} sản phẩm trong giỏ hàng
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={cartItems.every((item) => item.selected)}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="font-medium">
                    Chọn tất cả ({cartItems.length} sản phẩm)
                  </span>
                </div>
              </CardContent>
            </Card>

            {cartItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Checkbox
                        checked={item.selected}
                        onCheckedChange={() => toggleSelect(item.id)}
                      />
                      <Link
                        to={`/product/${item.id}`}
                        className="flex-shrink-0"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg border"
                        />
                      </Link>
                      <div className="flex-1">
                        <Link to={`/product/${item.id}`}>
                          <h3 className="font-semibold mb-1 hover:text-primary">{item.name}</h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-2">{item.shop}</p>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-lg font-bold text-primary">
                            {Number(item.price || 0).toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.id, -1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.id, 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Tạm tính ({selectedItems.length} sản phẩm)
                    </span>
                    <span className="font-medium">
                      {subtotal.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phí vận chuyển</span>
                    <span className="font-medium">
                      {shipping > 0 ? `${shipping.toLocaleString("vi-VN")}đ` : "Miễn phí"}
                    </span>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between mb-6">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="text-2xl font-bold text-primary">
                    {total.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-green-600"
                  disabled={selectedItems.length === 0}
                  onClick={handleCheckout}
                >
                  Thanh toán ({selectedItems.length})
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Bằng việc tiếp tục, bạn đồng ý với{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setTermsOpen(true)}
                  >
                    Điều khoản
                  </button>{" "}
                  của Plantify
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export {
  Cart
};
