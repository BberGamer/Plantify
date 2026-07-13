// ManageProducts.jsx - Trang quản lý sản phẩm cho business manager
import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCategories,
  useCreateProduct,
  useProducts,
} from "@/features/products/hooks";
import { ProductCard } from "@/features/products/components/ProductCard";
import { ProductForm } from "@/features/products/components/ProductForm";
import { toast } from "sonner";

function ManageProducts() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);

  const {
    products,
    total,
    pages,
    loading,
    error,
    refetch,
  } = useProducts({
    search,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    includeInactive: true,
    page,
    limit: 9,
    sortBy: "newest",
  });

  const { categories } = useCategories();
  const { create, loading: creating } = useCreateProduct();

  const handleCreate = async (payload) => {
    try {
      await create(payload);
      toast.success("Tạo sản phẩm thành công");
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã xảy ra lỗi");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-green-100 bg-gradient-to-r from-green-50 via-background to-emerald-50 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Quản lý sản phẩm
            </h1>
          </div>
          <ProductForm
            categories={categories}
            onSubmit={handleCreate}
            loading={creating}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="relative lg:col-span-7">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(event) => {
              const value = event.target.value;
              setSearchInput(value);
              setSearch(value.trim());
              setPage(1);
            }}
            placeholder="Tìm kiếm theo tên hoặc mô tả sản phẩm"
            className="pl-10"
          />
        </div>
        <div className="lg:col-span-3">
          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map((category) => (
                <SelectItem
                  key={category._id || category.id}
                  value={category._id || category.id}
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center lg:col-span-2">
          <Badge variant="outline" className="w-full justify-center border-green-200 bg-green-50 px-4 py-2 text-green-700">
            {loading ? "Đang tải..." : `${total} sản phẩm`}
          </Badge>
        </div>
      </section>

      <section>
        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
            Đang tải danh sách sản phẩm...
          </div>
        ) : error ? (
          <Card className="border-green-200/60 bg-white/95 shadow-sm">
            <CardContent className="py-20 text-center text-sm text-destructive">
              {error}
            </CardContent>
          </Card>
        ) : products.length === 0 ? (
          <Card className="border-green-200/60 bg-white/95 shadow-sm">
            <CardContent className="py-20 text-center text-sm text-muted-foreground">
              Chưa có sản phẩm nào phù hợp với bộ lọc hiện tại.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </section>

      {!loading && pages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Trước
          </Button>
          <div className="flex gap-1">
            {Array.from({ length: pages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                size="icon"
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            disabled={page >= pages}
            onClick={() => setPage((currentPage) => Math.min(pages, currentPage + 1))}
          >
            Sau <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export { ManageProducts };
