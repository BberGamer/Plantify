// Cart.jsx - Hiển thị trang giỏ hàng và điều phối thao tác mua hàng
import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";



import { ShoppingBag } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { useAuth } from "@/features/auth/hooks";
import { useCart } from "@/features/cart/hooks";
import { toast } from "sonner";
import { CartTermsDialog } from "@/features/cart/components/cart/CartTermsDialog";
import { CartContent } from "@/features/cart/components/cart/CartContent";

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
  const [termsOpen, setTermsOpen] = useState(false);
  const {
    cartItems,
    errorMessage: cartError,
    loading: cartLoading,
    removeItem: removeCartItem,
    toggleSelect: toggleCartItem,
    toggleSelectAll: toggleAllCartItems,
    selectedItems,
    shipping,
    subtotal,
    total,
    updateQuantity: updateCartQuantity,
  } = useCart({ authLoading, isAuthenticated });

  const updateQuantity = async (id, delta) => {
    try {
      await updateCartQuantity(id, delta);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể cập nhật giỏ hàng.");
    }
  };

  const toggleSelect = async (id) => {
    try {
      await toggleCartItem(id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể cập nhật giỏ hàng.");
    }
  };

  const toggleSelectAll = async () => {
    try {
      await toggleAllCartItems();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể cập nhật giỏ hàng.");
    }
  };

  const removeItem = async (id) => {
    try {
      await removeCartItem(id);
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
      <CartTermsDialog
        CART_TERMS={CART_TERMS}
        setTermsOpen={setTermsOpen}
        termsOpen={termsOpen}
      />

      <CartContent
        cartItems={cartItems}
        handleCheckout={handleCheckout}
        removeItem={removeItem}
        selectedItems={selectedItems}
        setTermsOpen={setTermsOpen}
        shipping={shipping}
        subtotal={subtotal}
        toggleSelect={toggleSelect}
        toggleSelectAll={toggleSelectAll}
        total={total}
        updateQuantity={updateQuantity}
      />
    </div>
  );
}

export {
  Cart
};
