import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShoppingCart, Star, Store } from "lucide-react";
import { motion } from "motion/react";

const mockProducts = [
  {
    id: 1,
    name: "Phân bón hữu cơ NPK",
    price: 85000,
    category: "Phân bón",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
    rating: 4.8,
    sold: 234,
    shop: "Green Garden"
  },
  {
    id: 2,
    name: "Bộ dụng cụ trồng cây mini",
    price: 150000,
    category: "Dụng cụ",
    image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400",
    rating: 4.9,
    sold: 156,
    shop: "Plant Tools Pro"
  },
  {
    id: 3,
    name: "Đất trồng chuyên dụng 5kg",
    price: 45000,
    category: "Đất & Giá thể",
    image: "https://images.unsplash.com/photo-1585571850696-e31f8b6e8c1a?w=400",
    rating: 4.7,
    sold: 389,
    shop: "Soil Master"
  },
  {
    id: 4,
    name: "Chậu gốm tráng men cao cấp",
    price: 280000,
    category: "Chậu & Giá đỡ",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400",
    rating: 4.9,
    sold: 98,
    shop: "Ceramic House"
  },
  {
    id: 5,
    name: "Thuốc trừ sâu sinh học",
    price: 120000,
    category: "Thuốc bảo vệ",
    image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400",
    rating: 4.6,
    sold: 167,
    shop: "Bio Garden"
  },
  {
    id: 6,
    name: "Hệ thống tưới nhỏ giọt",
    price: 350000,
    category: "Dụng cụ",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400",
    rating: 4.8,
    sold: 203,
    shop: "Smart Garden"
  }
];

const categories = [
  "Tất cả",
  "Phân bón",
  "Dụng cụ",
  "Đất & Giá thể",
  "Chậu & Giá đỡ",
  "Thuốc bảo vệ",
  "Hệ thống tưới"
];

function Shop() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("popular");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 to-white">
      <section className="bg-gradient-to-r from-primary to-green-600 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Store className="w-4 h-4" />
              <span className="text-sm font-medium">Marketplace</span>
            </div>
            <h1 className="text-5xl font-bold mb-4">Gian hàng Plantify</h1>
            <p className="text-xl text-white/90 mb-8">
              Mua sắm mọi sản phẩm chăm sóc cây cảnh tại một nơi
            </p>
            <div className="max-w-2xl mx-auto">
              <div className="relative flex items-center gap-3 bg-white rounded-2xl shadow-2xl p-2">
                <Search className="absolute left-6 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 focus-visible:ring-0 text-lg pl-12"
                />
                <Button size="lg" className="rounded-xl bg-gradient-to-r from-primary to-green-600">
                  Tìm kiếm
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                className="bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30"
                asChild
              >
                <Link to="/my-shop">
                  <Store className="w-4 h-4 mr-2" />
                  Gian hàng của tôi
                </Link>
              </Button>
              <Button
                variant="outline"
                className="bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30"
                asChild
              >
                <Link to="/cart">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Giỏ hàng
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-64 flex-shrink-0"
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Danh mục</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === category
                          ? "bg-primary text-white"
                          : "hover:bg-muted"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t">
                  <h3 className="font-semibold mb-4">Giá</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input placeholder="Từ" type="number" />
                      <span>-</span>
                      <Input placeholder="Đến" type="number" />
                    </div>
                    <Button variant="outline" className="w-full">
                      Áp dụng
                    </Button>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t">
                  <h3 className="font-semibold mb-4">Đánh giá</h3>
                  <div className="space-y-2">
                    {[5, 4, 3].map((stars) => (
                      <button
                        key={stars}
                        className="flex items-center gap-2 w-full text-left px-2 py-1 rounded hover:bg-muted"
                      >
                        <div className="flex">
                          {Array.from({ length: stars }).map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                        <span className="text-sm">trở lên</span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Hiển thị {mockProducts.length} sản phẩm
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Phổ biến nhất</SelectItem>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="price-low">Giá thấp đến cao</SelectItem>
                  <SelectItem value="price-high">Giá cao đến thấp</SelectItem>
                  <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/product/${product.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full">
                      <div className="aspect-square overflow-hidden relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <Badge className="absolute top-3 left-3 bg-white/95 text-primary border-0">
                          {product.category}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">
                              {product.rating}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Đã bán {product.sold}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {product.shop}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xl font-bold text-primary">
                            {product.price.toLocaleString("vi-VN")}đ
                          </p>
                          <Button size="sm" variant="outline">
                            <ShoppingCart className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-12">
              {[1, 2, 3, 4, 5].map((page) => (
                <Button
                  key={page}
                  variant={page === 1 ? "default" : "outline"}
                  size="sm"
                  className={
                    page === 1 ? "bg-gradient-to-r from-primary to-green-600" : ""
                  }
                >
                  {page}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export {
  Shop
};
