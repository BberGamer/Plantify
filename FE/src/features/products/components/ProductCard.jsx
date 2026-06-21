// ProductCard.jsx
// Card hiển thị tóm tắt sản phẩm cho Business Manager, click để mở trang chi tiết.
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";

export function ProductCard({ product }) {
  const navigate = useNavigate();
  const productId = product._id || product.id;
  const stock = Number(product.stock || 0);
  const imageUrl =
    product.images?.[0] ||
    product.thumbnail ||
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400";

  return (
    <Card
      className="group cursor-pointer overflow-hidden border-green-200/60 bg-white/95 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
      onClick={() => navigate(`/dashboard/products/${productId}`)}
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardContent className="space-y-4 p-4">
        <div>
          <h3 className="line-clamp-2 font-semibold text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-primary">
              {Number(product.price || 0).toLocaleString("vi-VN")}đ
            </p>
          </div>
          <div className="text-right">
            <p className={stock > 0 ? "font-semibold text-foreground" : "font-semibold text-rose-600"}>
              {stock}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
