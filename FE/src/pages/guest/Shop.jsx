import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShoppingCart, Star, Store } from "lucide-react";
import { motion } from "motion/react";
import { useProducts } from "@/features/products/hooks";
import { getCategories } from "@/features/products/api";

function Shop() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParam, setSearchParam] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("popular");
  
  // Price states
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Rating state
  const [selectedRating, setSelectedRating] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);

  // Dynamic categories
  const [categories, setCategories] = useState(["Tất cả"]);

  useEffect(() => {
    getCategories()
      .then((res) => {
        if (res.success && res.data) {
          const names = ["Tất cả", ...res.data.map((c) => c.name)];
          setCategories(names);
        }
      })
      .catch((err) => console.error("Lỗi lấy danh mục:", err));
  }, []);

  // Fetch products using custom hook
  const { products, total, pages, currentPage, loading, error } = useProducts({
    search: searchParam,
    category: selectedCategory,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    minRating: selectedRating || undefined,
    sortBy,
    page,
    limit: 6
  });

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setSearchParam(searchQuery);
    setPage(1);
  };

  const formatPrice = (value) => {
    // Chỉ giữ lại số
    const clean = value.replace(/\D/g, "");
    if (!clean) return "";
    const num = parseInt(clean, 10);
    if (num <= 0) return "";
    const capped = Math.min(num, 1000000000);
    return capped.toLocaleString("vi-VN");
  };

  const handleMinPriceChange = (e) => {
    setMinPriceInput(formatPrice(e.target.value));
  };

  const handleMaxPriceChange = (e) => {
    setMaxPriceInput(formatPrice(e.target.value));
  };

  const handleApplyPrice = () => {
    let rawMin = minPriceInput ? parseInt(minPriceInput.replace(/\./g, ""), 10) : "";
    let rawMax = maxPriceInput ? parseInt(maxPriceInput.replace(/\./g, ""), 10) : "";

    if (rawMin && rawMax && rawMin > rawMax) {
      const temp = rawMin;
      rawMin = rawMax;
      rawMax = temp;
      setMinPriceInput(rawMin.toLocaleString("vi-VN"));
      setMaxPriceInput(rawMax.toLocaleString("vi-VN"));
    }

    setMinPrice(rawMin);
    setMaxPrice(rawMax);
    setPage(1);
  };

  const handleClearPriceFilter = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };


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
              <form onSubmit={handleSearch} className="relative flex items-center gap-3 bg-white rounded-2xl shadow-2xl p-2">
                <Search className="absolute left-6 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 focus-visible:ring-0 text-lg pl-12 text-black"
                />
                <Button type="submit" size="lg" className="rounded-xl bg-gradient-to-r from-primary to-green-600 text-white">
                  Tìm kiếm
                </Button>
              </form>
            </div>
            <div className="flex items-center justify-center gap-4 mt-8">
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
                      onClick={() => {
                        setSelectedCategory(category);
                        setPage(1);
                      }}
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
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Giá (đ)</h3>
                    {(minPrice || maxPrice) && (
                      <button
                        onClick={handleClearPriceFilter}
                        className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors"
                      >
                        Xoá lọc
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Từ"
                        type="text"
                        value={minPriceInput}
                        onChange={handleMinPriceChange}
                        className="text-sm text-black"
                      />
                      <span>-</span>
                      <Input
                        placeholder="Đến"
                        type="text"
                        value={maxPriceInput}
                        onChange={handleMaxPriceChange}
                        className="text-sm text-black"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={handleApplyPrice}>
                        Áp dụng
                      </Button>
                      {(minPriceInput || maxPriceInput) && (
                        <Button
                          variant="ghost"
                          onClick={handleClearPriceFilter}
                          className="px-3 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          Xoá
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t">
                  <h3 className="font-semibold mb-4">Đánh giá</h3>
                  <div className="space-y-2">
                    {[5, 4, 3].map((stars) => (
                      <button
                        key={stars}
                        onClick={() => {
                          setSelectedRating(selectedRating === stars ? null : stars);
                          setPage(1);
                        }}
                        className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded hover:bg-muted transition-colors ${
                          selectedRating === stars ? "bg-muted font-medium text-primary" : ""
                        }`}
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
                Hiển thị {total} sản phẩm
              </p>
              <Select value={sortBy} onValueChange={(val) => { setSortBy(val); setPage(1); }}>
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

            {loading ? (
              <div className="flex justify-center items-center py-20 w-full">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-500 font-semibold">{error}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                Không tìm thấy sản phẩm nào phù hợp.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link to={`/product/${product._id}`}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full flex flex-col">
                        <div className="aspect-square overflow-hidden relative bg-muted">
                          <img
                            src={product.images?.[0] || product.thumbnail || "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400"}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <Badge className="absolute top-3 left-3 bg-white/95 text-primary border-0 shadow-sm">
                            {product.categoryId?.name || "Sản phẩm"}
                          </Badge>
                        </div>
                        <CardContent className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">
                                  {product.ratingAverage?.toFixed(1) || "0.0"}
                                </span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                Đã bán {product.ratingCount || 0}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {product.brand || "Plantify"}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-auto pt-2">
                            <p className="text-xl font-bold text-primary">
                              {product.price.toLocaleString("vi-VN")}đ
                            </p>
                            <Button size="sm" variant="outline" className="hover:bg-primary hover:text-white transition-colors">
                              <ShoppingCart className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {Array.from({ length: pages }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      size="sm"
                      className={
                        p === page ? "bg-gradient-to-r from-primary to-green-600 text-white" : ""
                      }
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export {
  Shop
};
