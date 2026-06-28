import { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageCarousel } from "@/components/common/ImageCarousel";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Store,
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
import { addCartItem } from "@/features/cart/api";
import { notifyCartUpdated, readLocalCart, writeLocalCart } from "@/features/cart/cartStorage";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productKey, setProductKey] = useState(0);
  const { product, loading, error } = useProduct(id, productKey);
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);

  // Refetch product sau khi user gui danh gia de cap nhat ratingAverage
  const handleRatingUpdate = useCallback(() => {
    setProductKey((k) => k + 1);
  }, []);

  const [isFavorite, setIsFavorite] = useState(() => {
    const saved = localStorage.getItem("favorites");
    if (!saved) return false;
    const favs = JSON.parse(saved);
    return favs.includes(id);
  });

  const handleAddToCart = async () => {
    if (!product) return false;
    try {
      if (isAuthenticated) {
        await addCartItem({
          productId: product._id,
          quantity,
          selected: true,
        });
        notifyCartUpdated();
        toast.success("Đã thêm vào giỏ hàng thành công!");
        return true;
      }

      let cart = readLocalCart();
      const existingItemIndex = cart.findIndex((item) => item.id === product._id);

      if (existingItemIndex > -1) {
        const newQty = cart[existingItemIndex].quantity + quantity;
        if (newQty > (product.stock || 0)) {
          toast.warning(`Chỉ có thể thêm tối đa ${product.stock} sản phẩm này.`);
          cart[existingItemIndex].quantity = product.stock || 0;
        } else {
          cart[existingItemIndex].quantity = newQty;
          toast.success("Đã cập nhật số lượng giỏ hàng!");
        }
      } else {
        const newItem = {
          id: product._id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          stock: product.stock || 0,
          image: product.thumbnail || (product.images && product.images[0]) || "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
          shop: product.brand || "Plantify Shop",
          selected: true
        };
        cart.push(newItem);
        toast.success("Đã thêm vào giỏ hàng thành công!");
      }

      writeLocalCart(cart);
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

  const handleToggleFavorite = () => {
    const saved = localStorage.getItem("favorites");
    let favs = saved ? JSON.parse(saved) : [];

    if (isFavorite) {
      favs = favs.filter(favId => favId !== id);
      setIsFavorite(false);
      toast.success("Đã xóa khỏi danh sách yêu thích!");
    } else {
      favs.push(id);
      setIsFavorite(true);
      toast.success("Đã thêm vào danh sách yêu thích!");
    }
    localStorage.setItem("favorites", JSON.stringify(favs));
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Xem sản phẩm ${product?.name} trên Plantify!`,
        url: shareUrl
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          toast.success("Đã sao chép liên kết sản phẩm!");
        })
        .catch(() => {
          toast.error("Không thể sao chép liên kết.");
        });
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
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span>/</span>
          <Link to="/marketplace" className="hover:text-primary">Gian hàng</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="overflow-hidden mb-4">
              <CardContent className="p-0">
                <ImageCarousel
                  images={images}
                  alt={product.name}
                  className="aspect-square rounded-none border-0"
                  imageClassName="object-cover"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Badge className="mb-3">{product.categoryId?.name || "Sản phẩm"}</Badge>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.ratingAverage || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="font-medium">{product.ratingAverage?.toFixed(1) || "0"}</span>
                <span className="text-muted-foreground">
                  ({product.ratingCount || 0} đánh giá)
                </span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-muted-foreground">
                Đã bán {product.soldCount || 0}
              </span>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-primary">
                  {(product.price ?? 0).toLocaleString("vi-VN")}đ
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Còn {product.stock || 0} sản phẩm
              </p>
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium mb-3 block">Số lượng</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-16 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock || 0, quantity + 1))}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Button
                size="lg"
                variant="outline"
                className="flex-1 border-primary text-primary hover:bg-primary/5"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Thêm vào giỏ hàng
              </Button>
              <Button
                size="lg"
                className="flex-1 bg-gradient-to-r from-primary to-green-600 text-white"
                onClick={handleBuyNow}
              >
                Mua ngay
              </Button>
              <div className="flex gap-2 justify-center">
                <Button size="lg" variant="outline" onClick={handleToggleFavorite}>
                  <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button size="lg" variant="outline" onClick={handleShare}>
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-5 h-5 text-primary" />
                <span>Chính hãng</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Truck className="w-5 h-5 text-primary" />
                <span>Giao nhanh</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MessageCircle className="w-5 h-5 text-primary" />
                <span>Hỗ trợ 24/7</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="description">Mô tả sản phẩm</TabsTrigger>
              <TabsTrigger value="usage-guide">Hướng dẫn sử dụng</TabsTrigger>
              <TabsTrigger value="specifications">Thông số kỹ thuật</TabsTrigger>
            </TabsList>

            <TabsContent value="description">
              <Card>
                <CardContent className="p-6">
                  {product.description ? (
                    <div className="whitespace-pre-line">{product.description}</div>
                  ) : (
                    <p className="text-muted-foreground italic">Chưa có mô tả sản phẩm.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="usage-guide">
              <Card>
                <CardContent className="p-6">
                  {product.usageGuide ? (
                    <div className="whitespace-pre-line">{product.usageGuide}</div>
                  ) : (
                    <p className="text-muted-foreground italic">Chưa có hướng dẫn sử dụng.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {product.brand && (
                      <div className="flex py-3 border-b">
                        <span className="w-1/3 text-muted-foreground">Thương hiệu</span>
                        <span className="flex-1 font-medium">{product.brand}</span>
                      </div>
                    )}
                    {product.tags?.length > 0 && (
                      <div className="flex py-3 border-b">
                        <span className="w-1/3 text-muted-foreground">Tags</span>
                        <div className="flex-1 flex flex-wrap gap-2">
                          {product.tags.map((tag, i) => (
                            <Badge key={i} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex py-3 border-b">
                      <span className="w-1/3 text-muted-foreground">Kho hàng</span>
                      <span className="flex-1 font-medium">{product.stock || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ProductReviews
            productId={product._id}
            ratingAverage={product.ratingAverage}
            ratingCount={product.ratingCount}
            onRatingUpdate={handleRatingUpdate}
          />
        </motion.div>
      </div>
    </div>
  );
}

export { ProductDetail };
