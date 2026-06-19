// CategoryForm.jsx - Form tạo/sửa danh mục sản phẩm
import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * CategoryForm - Form tạo/sửa danh mục sản phẩm
 * @param {Object} props
 * @param {function} props.onSubmit - Callback khi submit (nhận { id?, name })
 * @param {boolean} props.loading - Trạng thái loading
 * @param {Object} [props.editCategory] - Category cần sửa
 */
export function CategoryForm({ onSubmit, loading, editCategory }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");

  const isEditMode = !!editCategory;

  useEffect(() => {
    if (editCategory) {
      setName(editCategory.name || "");
      setIsOpen(true);
    }
  }, [editCategory]);

  const handleClose = () => {
    setIsOpen(false);
    setName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    await onSubmit({
      ...(isEditMode && { id: editCategory.id || editCategory._id }),
      name: trimmed,
    });
    handleClose();
  };

  if (!isEditMode) {
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo mới
        </Button>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tạo danh mục sản phẩm mới</DialogTitle>
              <DialogDescription>
                Nhập tên để tạo một danh mục sản phẩm mới trong hệ thống.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productCategoryName">Tên danh mục *</Label>
                <Input
                  id="productCategoryName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Phân bón, Dụng cụ làm vườn..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                  Hủy
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Tạo
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sửa danh mục sản phẩm</DialogTitle>
          <DialogDescription>
            Cập nhật tên danh mục sản phẩm đang được sử dụng trong hệ thống.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productCategoryName">Tên danh mục *</Label>
            <Input
              id="productCategoryName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Phân bón, Dụng cụ làm vườn..."
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
