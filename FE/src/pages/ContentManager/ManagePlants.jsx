// ManagePlants.jsx - Trang danh sách Plants cho Content Manager
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { PlantForm } from "@/features/plants/components/PlantForm";
import { PlantCard } from "@/features/plants/components/PlantCard";
import { usePlants, useCreatePlant, useDeletePlant, usePlantCategories } from "@/features/plants/hooks";
import { toast } from "sonner";

function ManagePlants() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { plants, loading, pages, refetch } = usePlants({
    search,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    page,
    limit: 12,
  });

  const { categories } = usePlantCategories();
  const { create, loading: creating } = useCreatePlant();
  const { remove, loading: deleting } = useDeletePlant();

  const handleCreate = async (payload) => {
    await create(payload);
    toast.success("Tạo cây thành công");
    refetch();
  };

  const handleDelete = async (plant) => {
    if (!confirm(`Xóa cây "${plant.name}"?`)) return;
    try {
      await remove(plant._id || plant.id);
      toast.success("Xóa cây thành công");
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã xảy ra lỗi");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Plants</h1>
          <p className="text-sm text-muted-foreground">
            Nhấn vào card để xem chi tiết cây
          </p>
        </div>
        <PlantForm categories={categories} onSubmit={handleCreate} loading={creating} />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm cây..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id || cat._id} value={cat.id || cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : plants.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-muted-foreground">Chưa có cây nào. Nhấn "Tạo mới" để thêm.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plants.map((plant) => (
            <PlantCard key={plant._id || plant.id} plant={plant} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Trước</Button>
          <span className="text-sm text-muted-foreground">Trang {page} / {pages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>Sau</Button>
        </div>
      )}
    </div>
  );
}

export { ManagePlants };
