// CartContent.jsx - Hiển thị danh sách sản phẩm, tổng tiền và thao tác trong giỏ hàng
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";

function CartContent({
  cartItems,
  handleCheckout,
  removeItem,
  selectedItems,
  setTermsOpen,
  shipping,
  subtotal,
  toggleSelect,
  toggleSelectAll,
  total,
  updateQuantity,
}) {
  return (
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
  );
}

export { CartContent };
