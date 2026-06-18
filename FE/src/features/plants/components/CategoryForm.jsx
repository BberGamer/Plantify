// CategoryForm.jsx - Form tạo Category
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";

/**
 * CategoryForm - Form tạo danh mục
 */
export function CategoryForm({ onSubmit, loading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");

  const handleOpen = () => {
    setName("");
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    await onSubmit({ name: trimmed });
    handleClose();
  };

  return (
    <>
      <Button onClick={handleOpen} className="gap-2">
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
