// ManageCategories.jsx - Trang quản lý Categories cho Content Manager
import { useState } from "react";
import { Loader2, FolderOpen, Trash2, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePlantCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from "@/features/plants/hooks";
import { CategoryForm } from "@/features/plants/components/CategoryForm";
import { toast } from "sonner";

function ManageCategories() {
  const { categories, loading, refetch } = usePlantCategories();
  const { create, loading: creating } = useCreateCategory();
  const { remove, loading: deleting } = useDeleteCategory();
  const { update, loading: updating } = useUpdateCategory();
  const [editingCategory, setEditingCategory] = useState(null);

  const handleCreate = async (payload) => {
    await create(payload);
    toast.success("Tạo danh mục thành công");
    refetch();
  };

  const handleUpdate = async (payload) => {
    await update(payload.id, { name: payload.name });
    toast.success("Cập nhật danh mục thành công");
    refetch();
    setEditingCategory(null);
  };

  const handleDelete = async (cat) => {
    if (!confirm(`Xóa danh mục "${cat.name}"?`)) return;
    try {
      await remove(cat.id || cat._id);
      toast.success("Xóa danh mục thành công");
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã xảy ra lỗi");
    }
  };

  const handleEditClick = (cat) => {
    setEditingCategory(cat);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Danh mục</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý các danh mục phân loại cây trồng
          </p>
        </div>
        <CategoryForm onSubmit={handleCreate} loading={creating} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : categories.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-muted-foreground">Chưa có danh mục nào. Nhấn "Tạo mới" để thêm.</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">#</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tên danh mục</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Số cây</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => (
                  <tr key={cat.id || cat._id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FolderOpen className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {cat.plantCount || 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditClick(cat)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(cat)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit form modal */}
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
