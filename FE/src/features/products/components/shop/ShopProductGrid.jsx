// ShopProductGrid.jsx - Hiển thị danh sách sản phẩm và trạng thái của cửa hàng
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from "lucide-react";
import { motion } from "motion/react";

function ShopProductGrid({ error, handleAddToCart, loading, page, pages, products, setPage, setSortBy, sortBy, total }) {
  return (
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
                                Đã bán {product.soldCount || 0}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground mb-3">
                              <span>{product.brand || "Plantify"}</span>
                              <span>Còn {product.stock || 0}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-auto pt-2">
                            <p className="text-xl font-bold text-primary">
                              {product.price.toLocaleString("vi-VN")}đ
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-primary hover:text-white transition-colors"
                              onClick={(event) => handleAddToCart(event, product)}
                              aria-label={`Thêm ${product.name} vào giỏ hàng`}
                            >
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
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? "default" : "outline"}
                      size="icon"
                      className={
                        pageNum === page ? "bg-gradient-to-r from-primary to-green-600 text-white" : ""
                      }
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
  );
}

export { ShopProductGrid };
