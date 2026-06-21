// ProductDetail.jsx - Trang chi tiết sản phẩm cho business manager
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Loader2, Package, Pencil, Trash2 } from "lucide-react";
import { ImageCarousel } from "@/components/common/ImageCarousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCategories, useDeleteProduct, useProduct, useUpdateProduct } from "@/features/products/hooks";
import { ProductForm } from "@/features/products/components/ProductForm";
import { toast } from "sonner";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, loading, error } = useProduct(id);
  const { categories } = useCategories();
  const { update, loading: updating } = useUpdateProduct();
  const { remove, loading: deleting } = useDeleteProduct();
  const [editingProduct, setEditingProduct] = useState(null);

  const imageList = useMemo(() => {
    if (!product) return [];
    if (product.images?.length) return product.images;
    if (product.thumbnail) return [product.thumbnail];
    return ["https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400"];
  }, [product]);

  const handleUpdate = async (payload) => {
    try {
      await update(payload.id, {
        name: payload.name,
        categoryId: payload.categoryId,
        images: payload.images,
        description: payload.description,
        price: payload.price,
        stock: payload.stock,
        ratingAverage: payload.ratingAverage,
        ratingCount: payload.ratingCount,
        tags: payload.tags,
      });
      toast.success("Cập nhật sản phẩm thành công");
      setEditingProduct(null);
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã xảy ra lỗi");
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    if (!confirm(`Xóa sản phẩm \"${product.name}\"?`)) return;

    try {
      await remove(product._id || product.id);
      toast.success("Xóa sản phẩm thành công");
      navigate("/dashboard/products", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã xảy ra lỗi");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
        Đang tải chi tiết sản phẩm...
      </div>
    );
  }

  if (error || !product) {
    return (
      <Card className="border-green-200/60 bg-white/95 shadow-sm">
        <CardContent className="space-y-4 py-16 text-center">
          <p className="text-sm text-destructive">{error || "Không tìm thấy sản phẩm"}</p>
          <Button asChild variant="outline">
            <Link to="/dashboard/products">Quay lại danh sách sản phẩm</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" asChild>
          <Link to="/dashboard/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setEditingProduct(product)} disabled={updating || deleting}>
            <Pencil className="mr-2 h-4 w-4" />
            Sửa
          </Button>
          <Button variant="outline" className="text-rose-600" onClick={handleDelete} disabled={updating || deleting}>
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </Button>
        </div>
      </div>

      <section className="rounded-3xl border border-green-100 bg-gradient-to-r from-green-50 via-background to-emerald-50 p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {product.name}
        </h1>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden border-green-200/60 bg-white/95 shadow-sm">
          <CardContent className="p-6">
            <ImageCarousel
              images={imageList}
              alt={product.name}
              className="aspect-square rounded-2xl bg-muted"
              imageClassName="object-cover"
            />
          </CardContent>
        </Card>

        <Card className="border-green-200/60 bg-white/95 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Thông tin sản phẩm
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Danh mục" value={product.categoryId?.name || "Chưa phân loại"} />
              <DetailItem label="Giá" value={`${Number(product.price || 0).toLocaleString("vi-VN")}đ`} />
              <DetailItem label="Tồn kho" value={product.stock || 0} />
              <DetailItem label="ratingAverage" value={product.ratingAverage || 0} />
              <DetailItem label="ratingCount" value={product.ratingCount || 0} />
              <DetailItem label="Số ảnh" value={product.images?.length || 0} />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Mô tả</p>
              <p className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
                {product.description || "Chưa có mô tả sản phẩm."}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Tags</p>
              <div className="flex flex-wrap gap-2">
                {product.tags?.length ? (
                  product.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Chưa có tag</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {editingProduct && (
        <ProductForm
          categories={categories}
          editProduct={editingProduct}
          onSubmit={handleUpdate}
          loading={updating}
        />
      )}
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-2xl bg-muted/40 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  );
}

export { ProductDetail };
