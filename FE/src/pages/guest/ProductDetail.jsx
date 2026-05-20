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
  Minus
} from "lucide-react";
import { motion } from "motion/react";

function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = {
    id: 1,
    name: "Phân bón hữu cơ NPK cao cấp",
    price: 85000,
    originalPrice: 120000,
    category: "Phân bón",
    images: [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800",
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800"
    ],
    rating: 4.8,
    reviewCount: 234,
    sold: 1234,
    stock: 150,
    shop: {
      name: "Green Garden Store",
      avatar: "",
      rating: 4.9,
      followers: 2340,
      products: 156
    },
    description: `
Phân bón hữu cơ NPK cao cấp được sản xuất từ nguyên liệu thiên nhiên 100%,
giúp cây phát triển khỏe mạnh, tăng cường sức đề kháng.

**Thành phần:**
- N (Nitơ): 10%
- P (Phospho): 10%
- K (Kali): 10%
- Vi lượng: Mg, Ca, Fe, Zn

**Công dụng:**
- Kích thích cây ra rễ, sinh trưởng mạnh
- Tăng khả năng ra hoa, đậu quả
- Cải thiện chất lượng đất
- An toàn cho người và môi trường

**Hướng dẫn sử dụng:**
- Pha loãng 1 muỗng canh (10ml) cho 1 lít nước
- Tưới 1-2 lần/tuần cho cây trồng trong chậu
- Bón lót trực tiếp vào đất với tỷ lệ 50g/m²
    `,
    specifications: [
      { label: "Thương hiệu", value: "GreenGarden" },
      { label: "Xuất xứ", value: "Việt Nam" },
      { label: "Khối lượng", value: "1kg" },
      { label: "Hạn sử dụng", value: "24 tháng" },
      { label: "Bảo quản", value: "Nơi khô ráo, thoáng mát" }
    ]
  };

  const reviews = [
    {
      id: 1,
      user: "Nguyễn Văn A",
      rating: 5,
      date: "15/05/2026",
      comment: "Sản phẩm rất tốt, cây nhà mình phát triển nhanh hơn hẳn!",
      images: []
    },
    {
      id: 2,
      user: "Trần Thị B",
      rating: 4,
      date: "10/05/2026",
      comment: "Chất lượng ổn, giá hợp lý. Sẽ mua lại.",
      images: []
    }
  ];

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
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
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
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Badge className="mb-3">{product.category}</Badge>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="font-medium">{product.rating}</span>
                <span className="text-muted-foreground">
                  ({product.reviewCount} đánh giá)
                </span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-muted-foreground">
                Đã bán {product.sold}
              </span>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-primary">
                  {product.price.toLocaleString("vi-VN")}đ
                </span>
                <span className="text-lg text-muted-foreground line-through">
                  {product.originalPrice.toLocaleString("vi-VN")}đ
                </span>
                <Badge variant="destructive">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Còn {product.stock} sản phẩm
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
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
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
                      <AvatarImage src={product.shop.avatar} />
                      <AvatarFallback className="bg-primary text-white">
                        {product.shop.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{product.shop.name}</h3>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{product.shop.rating}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <Link to={`/shop/${product.shop.name}`}>
                      <Store className="w-4 h-4 mr-2" />
                      Xem shop
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>Sản phẩm: {product.shop.products}</div>
                  <div>Người theo dõi: {product.shop.followers}</div>
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
              <TabsTrigger value="reviews">
                Đánh giá ({product.reviewCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description">
              <Card>
                <CardContent className="p-6 prose max-w-none">
                  <div className="whitespace-pre-line">{product.description}</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {product.specifications.map((spec, index) => (
                      <div key={index} className="flex py-3 border-b last:border-0">
                        <span className="w-1/3 text-muted-foreground">{spec.label}</span>
                        <span className="flex-1 font-medium">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardContent className="p-6 space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="pb-6 border-b last:border-0">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-primary text-white">
                            {review.user.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{review.user}</h4>
                            <span className="text-sm text-muted-foreground">
                              {review.date}
                            </span>
                          </div>
                          <div className="flex mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
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
