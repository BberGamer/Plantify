// PlantForm.jsx - Form tạo/cập nhật Plant
import { useState } from "react";
import { Loader2, Plus, X, GripVertical, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

const EMPTY_FORM = {
  name: "",
  scientificName: "",
  categoryId: "",
  images: [],
  shortDescription: "",
  description: "",
  difficultyLevel: "",
  sunlight: "",
  humidity: "",
  temperatureMin: "",
  temperatureMax: "",
  origin: "",
  tags: "",
  soil: "",
  toxicity: false,
};

import { ImageUploader } from "@/components/common/ImageUploader";

const toCommaArray = (str) =>
  str ? str.split(",").map((t) => t.trim()).filter(Boolean) : [];

/**
 * PlantForm - Form tạo Plant mới
 */
export function PlantForm({ categories, onSubmit, loading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const handleOpen = () => {
    setFormData(EMPTY_FORM);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormData(EMPTY_FORM);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      images: formData.images,
      tags: toCommaArray(formData.tags),
      temperatureMin: formData.temperatureMin !== "" ? Number(formData.temperatureMin) : undefined,
      temperatureMax: formData.temperatureMax !== "" ? Number(formData.temperatureMax) : undefined,
    };
    await onSubmit(payload);
    handleClose();
  };

  return (
    <>
      <Button onClick={handleOpen} className="gap-2">
        Tạo mới
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo cây mới</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tên cây *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="VD: Monstera Deliciosa"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scientificName">Tên khoa học</Label>
                <Input
                  id="scientificName"
                  value={formData.scientificName}
                  onChange={(e) => handleChange("scientificName", e.target.value)}
                  placeholder="VD: Monstera deliciosa"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Danh mục</Label>
                <Select value={formData.categoryId} onValueChange={(v) => handleChange("categoryId", v)}>
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id || cat._id} value={cat.id || cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficultyLevel">Độ khó</Label>
                <Select value={formData.difficultyLevel} onValueChange={(v) => handleChange("difficultyLevel", v)}>
                  <SelectTrigger id="difficultyLevel">
                    <SelectValue placeholder="Chọn độ khó" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dễ">Dễ</SelectItem>
                    <SelectItem value="Trung bình">Trung bình</SelectItem>
                    <SelectItem value="Khó">Khó</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Hình ảnh</Label>
              <ImageUploader
                images={formData.images}
                onChange={(newImages) => handleChange("images", newImages)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Mô tả ngắn</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => handleChange("shortDescription", e.target.value)}
                placeholder="Một câu mô tả ngắn về cây"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả chi tiết</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Nhập mô tả chi tiết về cây..."
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sunlight">Ánh sáng</Label>
                <Input
                  id="sunlight"
                  value={formData.sunlight}
                  onChange={(e) => handleChange("sunlight", e.target.value)}
                  placeholder="VD: Ánh sáng gián tiếp"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="humidity">Độ ẩm</Label>
                <Input
                  id="humidity"
                  value={formData.humidity}
                  onChange={(e) => handleChange("humidity", e.target.value)}
                  placeholder="VD: 60-80%"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="soil">Loại đất</Label>
                <Input
                  id="soil"
                  value={formData.soil}
                  onChange={(e) => handleChange("soil", e.target.value)}
                  placeholder="VD: Đất thoát nước tốt"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="temperatureMin">Nhiệt độ thấp nhất (°C)</Label>
                <Input
                  id="temperatureMin"
                  type="number"
                  value={formData.temperatureMin}
                  onChange={(e) => handleChange("temperatureMin", e.target.value)}
                  placeholder="VD: 18"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperatureMax">Nhiệt độ cao nhất (°C)</Label>
                <Input
                  id="temperatureMax"
                  type="number"
                  value={formData.temperatureMax}
                  onChange={(e) => handleChange("temperatureMax", e.target.value)}
                  placeholder="VD: 30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin">Nguồn gốc</Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => handleChange("origin", e.target.value)}
                  placeholder="VD: Châu Mỹ nhiệt đới"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleChange("tags", e.target.value)}
                placeholder="VD: cây cảnh, trong nhà, dễ trồng"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="toxicity"
                checked={formData.toxicity}
                onCheckedChange={(v) => handleChange("toxicity", v)}
              />
              <Label htmlFor="toxicity" className="cursor-pointer">
                Có độc tính (toxic)
              </Label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo mới
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
