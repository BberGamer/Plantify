// CategoryForm.jsx - Form tạo/sửa Category
import { useState, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";

/**
 * CategoryForm - Form tạo/sửa danh mục
 * @param {Object} props
 * @param {function} props.onSubmit - Callback khi submit (nhận { id?, name })
 * @param {boolean} props.loading - Trạng thái loading
 * @param {Object} [props.editCategory] - Category cần sửa (nếu có -> mode sửa)
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

  // Mode tạo mới: hiển thị nút bên ngoài
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
              <DialogTitle>Tạo danh mục mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="catName">Tên danh mục *</Label>
                <Input
                  id="catName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Cây tre, Cây ăn quả, Cây cảnh..."
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

  // Mode sửa: chỉ render Dialog, mở tự động khi có editCategory
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sửa danh mục</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="catName">Tên danh mục *</Label>
            <Input
              id="catName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Cây tre, Cây ăn quả, Cây cảnh..."
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
