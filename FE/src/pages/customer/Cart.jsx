import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { EmptyState } from "@/components/common/EmptyState";

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const updateQuantity = (id, delta) => {
    setCartItems(
      cartItems.map(
        (item) => item.id === id ? {
          ...item,
          quantity: Math.max(1, Math.min(item.stock, item.quantity + delta))
        } : item
      )
    );
  };

  const toggleSelect = (id) => {
    setCartItems(
      cartItems.map(
        (item) => item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleSelectAll = () => {
    const allSelected = cartItems.every((item) => item.selected);
    setCartItems(
      cartItems.map((item) => ({ ...item, selected: !allSelected }))
    );
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const selectedItems = cartItems.filter((item) => item.selected);
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 0 ? 30000 : 0;
  const total = subtotal + shipping;

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
                            {item.price.toLocaleString("vi-VN")}đ
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
                  onClick={() => navigate("/checkout")}
                >
                  Thanh toán ({selectedItems.length})
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Bằng việc tiếp tục, bạn đồng ý với{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Điều khoản
                  </Link>{" "}
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
