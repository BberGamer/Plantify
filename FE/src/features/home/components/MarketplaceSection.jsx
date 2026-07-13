/**
 * MarketplaceSection.jsx - Section giới thiệu Marketplace
 */
import { Link } from "react-router";
import { Store, ShoppingCart, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function MarketplaceSection() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <div className="marketplace-badge mb-4">
          <Store className="w-4 h-4" />
          <span className="text-sm font-medium">Marketplace</span>
        </div>
        <h2 className="text-4xl font-bold mb-4">Gian hàng Plantify</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Mua sắm mọi sản phẩm chăm sóc cây cảnh - từ phân bón, dụng cụ đến chậu cây
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Product Diversity */}
        <Card className="marketplace-card">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2 text-lg">Đa dạng sản phẩm</h3>
            <p className="text-muted-foreground text-sm">
              Hàng trăm sản phẩm chăm sóc, hỗ trợ cho cây cảnh
            </p>
          </CardContent>
        </Card>

        {/* Free Shop */}
        <Card className="marketplace-card">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2 text-lg">Chất lượng đảm bảo</h3>
            <p className="text-muted-foreground text-sm">Sản phẩm được kiểm định trước khi đến tay khách hàng</p>
          </CardContent>
        </Card>

        {/* Fast Delivery */}
        <Card className="marketplace-card">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2 text-lg">Giao hàng nhanh chóng</h3>
            <p className="text-muted-foreground text-sm">Nhận hàng tận nơi, an toàn</p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button size="lg" className="bg-gradient-to-r from-primary to-green-600" asChild>
          <Link to="/marketplace">
            <Store className="w-5 h-5 mr-2" />
            Khám phá gian hàng
          </Link>
        </Button>
      </div>
    </section>
  );
}
