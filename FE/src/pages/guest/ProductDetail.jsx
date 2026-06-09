import { useState } from "react";
import { Link, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

function ProductDetail() {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

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
  const currentPrice = product.price ?? 0;
  const originalPrice = product.originalPrice ?? product.price * 1.2 ?? 0;
  const discount = Math.round((1 - currentPrice / originalPrice) * 100);

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
                <div className="aspect-square overflow-hidden">
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? "border-primary" : "border-transparent hover:border-primary/50"}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
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
                Đã bán {product.ratingCount || 0}
              </span>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-primary">
                  {currentPrice.toLocaleString("vi-VN")}đ
                </span>
                {discount > 0 && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {originalPrice.toLocaleString("vi-VN")}đ
                    </span>
                    <Badge variant="destructive">-{discount}%</Badge>
                  </>
                )}
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

            <div className="flex gap-3 mb-6">
              <Button
                size="lg"
                className="flex-1 bg-gradient-to-r from-primary to-green-600"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Thêm vào giỏ hàng
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={mockShop.avatar} />
                      <AvatarFallback className="bg-primary text-white">
                        {mockShop.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{mockShop.name}</h3>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{mockShop.rating}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <Link to={`/shop/${mockShop.name}`}>
                      <Store className="w-4 h-4 mr-2" />
                      Xem shop
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>Sản phẩm: {mockShop.products}</div>
                  <div>Người theo dõi: {mockShop.followers}</div>
                </div>
              </CardContent>
            </Card>

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
      </div>
    </div>
  );
}

export { ProductDetail };
