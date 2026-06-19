// ProductCard.jsx - Card hiển thị sản phẩm cho business manager
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Pencil, Trash2 } from "lucide-react";

function getStockBadge(stock) {
  if (stock <= 0) {
    return {
      label: "Hết hàng",
      className: "border-transparent bg-rose-100 text-rose-700 hover:bg-rose-100",
    };
  }

  if (stock <= 10) {
    return {
      label: "Sắp hết",
      className: "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-100",
    };
  }

  return {
    label: "Còn hàng",
    className: "border-transparent bg-green-100 text-green-700 hover:bg-green-100",
  };
}

/**
 * ProductCard - Card hiển thị sản phẩm
 * @param {Object} props
 * @param {Object} props.product
 * @param {function} props.onEdit
 * @param {function} props.onDelete
 * @param {boolean} [props.disabled]
 */
export function ProductCard({ product, onEdit, onDelete, disabled = false }) {
  const stockBadge = getStockBadge(product.stock || 0);
  const imageUrl =
    product.images?.[0] ||
    product.thumbnail ||
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400";

  return (
    <Card className="overflow-hidden border-green-200/60 bg-white/95 shadow-sm transition-shadow hover:shadow-md">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" />
      </div>
      <CardContent className="space-y-4 p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="line-clamp-2 font-semibold text-foreground">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                {product.categoryId?.name || "Chưa phân loại"}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </div>
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {product.description || "Chưa có mô tả sản phẩm."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{Number(product.price || 0).toLocaleString("vi-VN")}đ</Badge>
          <Badge className={stockBadge.className}>{stockBadge.label}</Badge>
          {product.brand ? <Badge variant="secondary">{product.brand}</Badge> : null}
          {product.isActive === false ? (
            <Badge className="border-transparent bg-slate-200 text-slate-700 hover:bg-slate-200">
              Đang ẩn
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Tồn kho: {product.stock || 0}</span>
          <span>{product.tags?.length || 0} tag</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(product)}
            disabled={disabled}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Sửa
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 text-rose-600"
            onClick={() => onDelete(product)}
            disabled={disabled}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
