import { useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageCarousel } from "@/components/common/ImageCarousel";
import {
  Star,
  ShoppingCart,
  Shield,
  Truck,
  MessageCircle,
  Plus,
  Minus,
  AlertCircle
} from "lucide-react";
import { motion } from "motion/react";
import { useProduct } from "@/features/products/hooks";
import { toast } from "sonner";
import { ProductReviews } from "@/components/common/ProductReviews";
import { useAuth } from "@/features/auth/hooks";
import { useCartMutations } from "@/features/cart/hooks";
import { ProductDetailContent } from "@/features/products/components/product-detail/ProductDetailContent";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productKey, setProductKey] = useState(0);
  const { product, loading, error } = useProduct(id, productKey);
  const { isAuthenticated } = useAuth();
  const { addProduct } = useCartMutations();
  const [quantity, setQuantity] = useState(1);

  // Refetch product sau khi user gui danh gia de cap nhat ratingAverage
  const handleRatingUpdate = useCallback(() => {
    setProductKey((k) => k + 1);
  }, []);


  const handleAddToCart = async () => {
    if (!product) return false;
    try {
      const result = await addProduct({
        product,
        quantity,
        isAuthenticated,
        limitWhenStockMissing: true,
      });

      if (result.status === "limited") {
        toast.warning(`Chỉ có thể thêm tối đa ${result.stock} sản phẩm này.`);
      } else if (result.status === "updated") {
        toast.success("Đã cập nhật số lượng giỏ hàng!");
      } else {
        toast.success("Đã thêm vào giỏ hàng thành công!");
      }
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Không thể thêm vào giỏ hàng.");
      return false;
    }
  };

  const handleBuyNow = async () => {
    const added = await handleAddToCart();
    if (added) {
      navigate("/cart");
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Không tìm thấy sản phẩm</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link to="/marketplace">Quay lại gian hàng</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images?.length > 0 ? product.images : [product.thumbnail || "https://via.placeholder.com/800"];

  const mockShop = {
    name: "Plantify Shop",
    avatar: "",
    rating: 4.8,
    followers: 1200,
    products: 45
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 to-white py-12 px-4">
      <ProductDetailContent handleAddToCart={handleAddToCart} handleBuyNow={handleBuyNow} handleRatingUpdate={handleRatingUpdate} images={images} product={product} quantity={quantity} setQuantity={setQuantity} />
    </div>
  );
}

export { ProductDetail };
