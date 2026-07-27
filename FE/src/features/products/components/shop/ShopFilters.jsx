import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { motion } from "motion/react";

function ShopFilters({
  categories,
  handleApplyPrice,
  handleClearPriceFilter,
  handleMaxPriceChange,
  handleMinPriceChange,
  maxPrice,
  maxPriceInput,
  minPrice,
  minPriceInput,
  selectedCategory,
  selectedRating,
  setPage,
  setSelectedCategory,
  setSelectedRating,
}) {
  return (
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
                    {[5, 4, 3, 2, 1].map((stars) => (
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
  );
}

export { ShopFilters };
