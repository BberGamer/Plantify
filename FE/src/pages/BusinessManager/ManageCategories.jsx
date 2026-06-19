// ManageCategories.jsx - Trang quản lý danh mục sản phẩm cho business manager
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/features/products/hooks";
import { CategoryForm } from "@/features/products/components/CategoryForm";
import { toast } from "sonner";
import { FolderOpen, Loader2, Pencil, Tags, Trash2 } from "lucide-react";

function ManageCategories() {
  const { categories, loading, error, refetch } = useCategories();
  const { create, loading: creating } = useCreateCategory();
  const { update, loading: updating } = useUpdateCategory();
  const { remove, loading: deleting } = useDeleteCategory();
  const [editingCategory, setEditingCategory] = useState(null);

  const handleCreate = async (payload) => {
    try {
      await create(payload);
      toast.success("Tạo danh mục sản phẩm thành công");
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã xảy ra lỗi");
    }
  };

  const handleUpdate = async (payload) => {
    try {
      await update(payload.id, { name: payload.name });
      toast.success("Cập nhật danh mục sản phẩm thành công");
      refetch();
      setEditingCategory(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã xảy ra lỗi");
    }
  };

  const handleDelete = async (category) => {
    if (!confirm(`Xóa danh mục "${category.name}"?`)) return;

    try {
      await remove(category.id || category._id);
      toast.success("Xóa danh mục sản phẩm thành công");
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã xảy ra lỗi");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-green-100 bg-gradient-to-r from-green-50 via-background to-emerald-50 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <Badge className="w-fit border-transparent bg-green-100 text-green-700 hover:bg-green-100">
              Product Category Management
            </Badge>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Quản lý loại sản phẩm
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
                Business manager có thể thêm, sửa và xóa danh mục sản phẩm tại đây.
              </p>
            </div>
          </div>
          <CategoryForm onSubmit={handleCreate} loading={creating} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card className="border-green-200/60 bg-white/95 shadow-sm">
          <CardContent className="flex items-center justify-between gap-4 p-6">
            <div>
              <p className="text-sm text-muted-foreground">Tổng danh mục</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {loading ? "..." : categories.length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Tags className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden border-green-200/60 bg-white/95 shadow-sm">
        <CardHeader className="border-b border-green-100 bg-gradient-to-r from-white to-green-50/80">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl text-foreground">Danh sách loại sản phẩm</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Danh mục được dùng để phân loại sản phẩm trong hệ thống.
              </p>
            </div>
            <Badge className="border-transparent bg-primary/10 text-primary hover:bg-primary/10">
              {loading ? "Đang tải..." : `${categories.length} danh mục`}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
              Đang tải danh mục sản phẩm...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-sm text-destructive">
              {error}
            </div>
          ) : categories.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              Chưa có danh mục nào. Nhấn "Tạo mới" để thêm danh mục sản phẩm.
            </div>
          ) : (
            <div className="divide-y divide-green-100/80">
              {categories.map((category, index) => (
                <div
                  key={category.id || category._id}
                  className="flex flex-col gap-4 px-4 py-4 hover:bg-green-50/30 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <FolderOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{category.name}</p>
                      <p className="text-sm text-muted-foreground">Danh mục #{index + 1}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCategory(category)}
                      disabled={updating || deleting}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Sửa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-600"
                      onClick={() => handleDelete(category)}
                      disabled={updating || deleting}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingCategory && (
        <CategoryForm
          editCategory={editingCategory}
          onSubmit={handleUpdate}
          loading={updating}
        />
      )}
    </div>
  );
}

export { ManageCategories };
