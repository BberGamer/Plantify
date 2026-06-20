// ImageUploader.jsx - Component dùng chung để quản lý danh sách URL hình ảnh
import { useState } from "react";
import { Plus, X, GripVertical, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ImageUploader({ images = [], onChange }) {
  const [newUrl, setNewUrl] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);

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

  // Drag and drop reordering
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    onChange(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-3">
      {/* Grid thumbnails */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative group aspect-square rounded-lg overflow-hidden border-2 ${
                draggedIndex === index ? "border-primary opacity-50" : "border-transparent"
              } cursor-grab active:cursor-grabbing`}
            >
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23999' font-size='12'%3EError%3C/text%3E%3C/svg%3E";
                }}
              />

              {/* Drag handle */}
              <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/50 rounded p-1">
                  <GripVertical className="w-3 h-3 text-white" />
                </div>
              </div>

              {/* Delete button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/80"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Index badge */}
              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
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
