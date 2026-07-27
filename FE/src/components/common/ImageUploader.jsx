// ImageUploader.jsx - Hiển thị và quản lý danh sách URL hình ảnh dùng chung
import { useState } from "react";
import { Plus, X, ImageIcon } from "lucide-react";
import { ImageCarousel } from "@/components/common/ImageCarousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Chọn nhiều ảnh, tạo preview Object URL và trả danh sách mới cho form cha.
 * @param {Object} props - Component props.
 * @param {Array} [props.images=[]] - Danh sách ảnh hiện tại.
 * @param {Function} props.onChange - Callback cập nhật danh sách ảnh.
 * @returns {JSX.Element} Bộ chọn và preview ảnh.
 */
export function ImageUploader({ images = [], onChange }) {
  const [newUrl, setNewUrl] = useState("");

  const addImage = () => {
    const trimmed = newUrl.trim();
    if (trimmed && !images.includes(trimmed)) {
      onChange([...images, trimmed]);
      setNewUrl("");
    }
  };

  const removeImage = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addImage();
    }
  };

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <ImageCarousel
          images={images}
          alt="Anh"
          className="aspect-video"
          onRemove={removeImage}
          removeLabel="Xóa ảnh hiện tại"
        />
      )}

      {/* Add image input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập URL ảnh..."
            className="pr-10"
          />
          {newUrl && (
            <button
              type="button"
              onClick={() => setNewUrl("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button type="button" variant="outline" onClick={addImage} disabled={!newUrl.trim()}>
          <Plus className="w-4 h-4 mr-1" />
          Thêm ảnh
        </Button>
      </div>

      {images.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ImageIcon className="w-4 h-4" />
          <span>Chưa có ảnh nào. Thêm ảnh bằng cách dán URL bên trên.</span>
        </div>
      )}
    </div>
  );
}
