// PlantEditForm.jsx - Form chỉnh sửa Plant + Modal thêm Care Guide + Modal thêm Disease
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Loader2, Plus, X, GripVertical, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// Constants
const EMPTY_PLANT_FORM = {
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
  soil: "",
  toxicity: false,
  tags: "",
};

const SEASON_OPTIONS = [
  { value: "all", label: "Tất cả mùa" },
  { value: "spring", label: "Mùa xuân" },
  { value: "summer", label: "Mùa hè" },
  { value: "autumn", label: "Mùa thu" },
  { value: "winter", label: "Mùa đông" },
];

const toCommaString = (arr) => (Array.isArray(arr) && arr.length > 0 ? arr.join(", ") : "");
const toCommaArray = (str) => (str ? str.split(",").map((t) => t.trim()).filter(Boolean) : []);

// ===================== IMAGE UPLOADER COMPONENT =====================

function ImageUploader({ images, onChange }) {
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
              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
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

// ===================== PLANT EDIT FORM =====================

/**
 * PlantEditForm - Form chỉnh sửa Plant
 */
export function PlantEditForm({ plant, categories, onUpdate, loading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_PLANT_FORM);

  useEffect(() => {
    if (plant && isOpen) {
      setForm({
        name: plant.name || "",
        scientificName: plant.scientificName || "",
        categoryId: plant.categoryId || "",
        images: Array.isArray(plant.images) ? [...plant.images] : [],
        shortDescription: plant.shortDescription || "",
        description: plant.description || "",
        difficultyLevel: plant.difficultyLevel || "",
        sunlight: plant.sunlight || "",
        humidity: plant.humidity || "",
        temperatureMin: plant.temperatureMin ?? "",
        temperatureMax: plant.temperatureMax ?? "",
        origin: plant.origin || "",
        soil: plant.soil || "",
        toxicity: plant.toxicity ?? false,
        tags: Array.isArray(plant.tags) ? plant.tags.join(", ") : "",
      });
    }
  }, [plant, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      tags: toCommaArray(form.tags),
      temperatureMin: form.temperatureMin !== "" ? Number(form.temperatureMin) : undefined,
      temperatureMax: form.temperatureMax !== "" ? Number(form.temperatureMax) : undefined,
    };
    await onUpdate(payload);
    setIsOpen(false);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        Sửa
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa cây</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tên và Tên khoa học */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tên cây *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scientificName">Tên khoa học</Label>
                <Input id="scientificName" value={form.scientificName} onChange={(e) => setForm((p) => ({ ...p, scientificName: e.target.value }))} placeholder="VD: Monstera deliciosa" />
              </div>
            </div>

            {/* Danh mục và Độ khó */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Danh mục</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm((p) => ({ ...p, categoryId: v }))}>
                  <SelectTrigger id="categoryId"><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficultyLevel">Độ khó</Label>
                <Select value={form.difficultyLevel} onValueChange={(v) => setForm((p) => ({ ...p, difficultyLevel: v }))}>
                  <SelectTrigger id="difficultyLevel"><SelectValue placeholder="Chọn độ khó" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dễ">Dễ</SelectItem>
                    <SelectItem value="Trung bình">Trung bình</SelectItem>
                    <SelectItem value="Khó">Khó</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mô tả ngắn */}
            <div className="space-y-2">
              <Label htmlFor="shortDescription">Mô tả ngắn</Label>
              <Input id="shortDescription" value={form.shortDescription} onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))} placeholder="VD: Cây leo nhiệt đới phổ biến" />
            </div>

            {/* Mô tả chi tiết */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả chi tiết</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} placeholder="Mô tả chi tiết về cây..." />
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label>Hình ảnh</Label>
              <ImageUploader
                images={form.images}
                onChange={(newImages) => setForm((p) => ({ ...p, images: newImages }))}
              />
            </div>

            {/* Ánh sáng, Độ ẩm, Loại đất */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sunlight">Ánh sáng</Label>
                <Input id="sunlight" value={form.sunlight} onChange={(e) => setForm((p) => ({ ...p, sunlight: e.target.value }))} placeholder="VD: Ánh sáng gián tiếp" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="humidity">Độ ẩm</Label>
                <Input id="humidity" value={form.humidity} onChange={(e) => setForm((p) => ({ ...p, humidity: e.target.value }))} placeholder="VD: 60-80%" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="soil">Loại đất</Label>
                <Input id="soil" value={form.soil} onChange={(e) => setForm((p) => ({ ...p, soil: e.target.value }))} placeholder="VD: Đất thoáng nước" />
              </div>
            </div>

            {/* Nhiệt độ min, max và Nguồn gốc */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="temperatureMin">Nhiệt độ min (°C)</Label>
                <Input id="temperatureMin" type="number" value={form.temperatureMin} onChange={(e) => setForm((p) => ({ ...p, temperatureMin: e.target.value }))} placeholder="VD: 15" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperatureMax">Nhiệt độ max (°C)</Label>
                <Input id="temperatureMax" type="number" value={form.temperatureMax} onChange={(e) => setForm((p) => ({ ...p, temperatureMax: e.target.value }))} placeholder="VD: 30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin">Nguồn gốc</Label>
                <Input id="origin" value={form.origin} onChange={(e) => setForm((p) => ({ ...p, origin: e.target.value }))} placeholder="VD: Châu Mỹ" />
              </div>
            </div>

            {/* Tags và Độc tính */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
                <Input id="tags" value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} placeholder="VD: cây cảnh, trong nhà" />
              </div>
              <div className="space-y-2">
                <Label>Độc tính</Label>
                <div className="flex items-center gap-4 h-10">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="toxicity" checked={form.toxicity === false} onChange={() => setForm((p) => ({ ...p, toxicity: false }))} />
                    Không độc
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="toxicity" checked={form.toxicity === true} onChange={() => setForm((p) => ({ ...p, toxicity: true }))} />
                    Có độc
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Cập nhật
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ===================== CARE GUIDE FORM =====================

const CareGuideFormInner = forwardRef(({ plantId, plantName, onCreate, loading }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    season: "all",
    wateringFrequency: "",
    fertilizingFrequency: "",
    pruningNotes: "",
  });

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onCreate({ ...form, plantId });
    setIsOpen(false);
    setForm({ title: "", content: "", season: "all", wateringFrequency: "", fertilizingFrequency: "", pruningNotes: "" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Thêm Care Guide cho {plantName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cg-title">Tiêu đề *</Label>
            <Input id="cg-title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="VD: Hướng dẫn tưới nước mùa hè" required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cg-season">Mùa</Label>
              <Select value={form.season} onValueChange={(v) => setForm((p) => ({ ...p, season: v }))}>
                <SelectTrigger id="cg-season"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEASON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cg-watering">Tần suất tưới</Label>
              <Input id="cg-watering" value={form.wateringFrequency} onChange={(e) => setForm((p) => ({ ...p, wateringFrequency: e.target.value }))} placeholder="VD: 2 lần/tuần" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cg-fertilizer">Tần suất bón phân</Label>
            <Input id="cg-fertilizer" value={form.fertilizingFrequency} onChange={(e) => setForm((p) => ({ ...p, fertilizingFrequency: e.target.value }))} placeholder="VD: 1 tháng/lần" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cg-pruning">Ghi chú cắt tỉa</Label>
            <Textarea id="cg-pruning" value={form.pruningNotes} onChange={(e) => setForm((p) => ({ ...p, pruningNotes: e.target.value }))} rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cg-content">Nội dung chi tiết</Label>
            <Textarea id="cg-content" value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} rows={4} placeholder="Nhập hướng dẫn chi tiết..." />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Thêm Care Guide
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

CareGuideFormInner.displayName = "CareGuideFormInner";

export const CareGuideForm = CareGuideFormInner;

// ===================== DISEASE FORM =====================

const DiseaseFormInner = forwardRef(({ plantName, onCreate, loading }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    symptoms: "",
    causes: "",
    treatment: "",
    prevention: "",
    severity: "medium",
    affectedPlants: "",
  });

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onCreate({
      ...form,
      affectedPlants: [plantName, ...toCommaArray(form.affectedPlants)],
    });
    setIsOpen(false);
    setForm({ name: "", symptoms: "", causes: "", treatment: "", prevention: "", severity: "medium", affectedPlants: "" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Thêm bệnh cho {plantName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="d-name">Tên bệnh *</Label>
            <Input id="d-name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="VD: Bệnh đốm nâu" required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="d-severity">Mức độ nghiêm trọng</Label>
              <Select value={form.severity} onValueChange={(v) => setForm((p) => ({ ...p, severity: v }))}>
                <SelectTrigger id="d-severity"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Thấp</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-affected">Cây bị ảnh hưởng khác</Label>
              <Input id="d-affected" value={form.affectedPlants} onChange={(e) => setForm((p) => ({ ...p, affectedPlants: e.target.value }))} placeholder="VD: Lúa, Ngô" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="d-symptoms">Triệu chứng</Label>
            <Textarea id="d-symptoms" value={form.symptoms} onChange={(e) => setForm((p) => ({ ...p, symptoms: e.target.value }))} rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="d-causes">Nguyên nhân</Label>
            <Textarea id="d-causes" value={form.causes} onChange={(e) => setForm((p) => ({ ...p, causes: e.target.value }))} rows={2} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="d-treatment">Cách điều trị</Label>
              <Textarea id="d-treatment" value={form.treatment} onChange={(e) => setForm((p) => ({ ...p, treatment: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-prevention">Phòng ngừa</Label>
              <Textarea id="d-prevention" value={form.prevention} onChange={(e) => setForm((p) => ({ ...p, prevention: e.target.value }))} rows={2} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Thêm Bệnh
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

DiseaseFormInner.displayName = "DiseaseFormInner";

export const DiseaseForm = DiseaseFormInner;
