// RecommendedProductsPicker.jsx - Chọn nhiều sản phẩm đề xuất cho bệnh cây
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, PackageSearch, Search } from "lucide-react";
import { getReferenceId } from "@/features/plant-diseases/plantDiseaseForm.utils";

const formatPrice = (value) => (
  `${Number(value || 0).toLocaleString("vi-VN")}đ`
);

/**
 * Hiển thị danh sách sản phẩm có tìm kiếm và checkbox chọn nhiều.
 */
export function RecommendedProductsPicker({
  open,
  products,
  linkedProducts,
  selectedProductIds,
  loading,
  error,
  onToggle,
}) {
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (open) setSearchValue("");
  }, [open]);

  const availableProducts = useMemo(() => {
    const productMap = new Map();

    [...products, ...linkedProducts].forEach((product) => {
      const productId = getReferenceId(product);
      if (productId && typeof product === "object") {
        productMap.set(productId, product);
      }
    });

    return [...productMap.values()];
  }, [linkedProducts, products]);

  const filteredProducts = useMemo(() => {
    const keyword = searchValue.trim().toLocaleLowerCase("vi");
    if (!keyword) return availableProducts;

    return availableProducts.filter((product) => (
      [product.name, product.brand, ...(product.tags || [])]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("vi").includes(keyword))
    ));
  }, [availableProducts, searchValue]);

  return (
    <section className="space-y-4 border-t pt-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">Sản phẩm đề xuất</h3>
          <p className="text-xs text-muted-foreground">
            Chọn sản phẩm phù hợp để backend trả về cùng kết quả chẩn đoán.
          </p>
        </div>
        <Badge variant="outline">
          Đã chọn {selectedProductIds.length}
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Tìm sản phẩm theo tên, thương hiệu hoặc tag..."
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border">
        {loading ? (
          <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải sản phẩm...
          </div>
        ) : error ? (
          <div className="px-4 py-8 text-center text-sm text-destructive">
            {error}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex min-h-32 flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground">
            <PackageSearch className="h-6 w-6" />
            Không tìm thấy sản phẩm phù hợp.
          </div>
        ) : (
          <ScrollArea className="h-56">
            <div className="divide-y">
              {filteredProducts.map((product) => {
                const productId = getReferenceId(product);
                const isSelected = selectedProductIds.includes(productId);
                const isUnavailable = product.isActive === false;

                return (
                  <div
                    key={productId}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <Checkbox
                      id={`md-product-${productId}`}
                      checked={isSelected}
                      disabled={isUnavailable && !isSelected}
                      onCheckedChange={() => onToggle(productId)}
                    />
                    <Label
                      htmlFor={`md-product-${productId}`}
                      className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 font-normal"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {product.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {formatPrice(product.price)} · Tồn kho {Number(product.stock || 0)}
                        </span>
                      </span>
                      {isUnavailable && (
                        <Badge variant="secondary" className="shrink-0">
                          Ngừng bán
                        </Badge>
                      )}
                    </Label>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </section>
  );
}
