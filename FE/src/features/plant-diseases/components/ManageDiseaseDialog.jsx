// ManageDiseaseDialog.jsx - Dialog tạo/chỉnh sửa Bệnh cây
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ImageUploader } from "@/components/common/ImageUploader";

export function ManageDiseaseDialog({ open, onOpenChange, disease, plants = [], onSubmit, loading }) {
  const [form, setForm] = useState({
    name: "",
    plantId: "",
    symptoms: "",
    causes: "",
    treatment: "",
    prevention: "",
    images: [],
  });

  useEffect(() => {
    if (disease) {
      setForm({
        name: disease.name || "",
        plantId: disease.plantId?._id || disease.plantId || "",
        symptoms: disease.symptoms || "",
        causes: disease.causes || "",
        treatment: disease.treatment || "",
        prevention: disease.prevention || "",
        images: Array.isArray(disease.images) ? disease.images : [],
      });
    } else {
      setForm({
        name: "",
        plantId: plants[0]?._id || "",
        symptoms: "",
        causes: "",
        treatment: "",
        prevention: "",
        images: [],
      });
    }
  }, [disease, open, plants]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      plantId: form.plantId,
      symptoms: form.symptoms.trim(),
      causes: form.causes.trim(),
      treatment: form.treatment.trim(),
      prevention: form.prevention.trim(),
      images: form.images,
    };
    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {disease ? "Chỉnh sửa bệnh cây" : "Thêm bệnh cây mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="md-name">Tên bệnh *</Label>
              <Input
                id="md-name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="VD: Bệnh đốm lá nâu"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="md-plant">Cây trồng *</Label>
              <Select
                value={form.plantId}
                onValueChange={(val) => setForm((p) => ({ ...p, plantId: val }))}
              >
                <SelectTrigger id="md-plant">
                  <SelectValue placeholder="Chọn cây trồng" />
                </SelectTrigger>
                <SelectContent>
                  {plants.map((plant) => (
                    <SelectItem key={plant._id || plant.id} value={plant._id || plant.id}>
                      {plant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="md-symptoms">Triệu chứng</Label>
            <Textarea
              id="md-symptoms"
              value={form.symptoms}
              onChange={(e) => setForm((p) => ({ ...p, symptoms: e.target.value }))}
              placeholder="VD: Các đốm nâu hoặc đen xuất hiện trên lá..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="md-causes">Nguyên nhân</Label>
            <Textarea
              id="md-causes"
              value={form.causes}
              onChange={(e) => setForm((p) => ({ ...p, causes: e.target.value }))}
              placeholder="VD: Do nấm Cercospora gây ra khi độ ẩm cao..."
              rows={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="md-treatment">Cách điều trị</Label>
              <Textarea
                id="md-treatment"
                value={form.treatment}
                onChange={(e) => setForm((p) => ({ ...p, treatment: e.target.value }))}
                placeholder="VD: Cắt bỏ lá bệnh, phun thuốc diệt nấm..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="md-prevention">Phòng ngừa</Label>
              <Textarea
                id="md-prevention"
                value={form.prevention}
                onChange={(e) => setForm((p) => ({ ...p, prevention: e.target.value }))}
                placeholder="VD: Tưới nước ở gốc, giữ thông thoáng..."
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hình ảnh bệnh cây</Label>
            <ImageUploader
              images={form.images}
              onChange={(newImages) => setForm((p) => ({ ...p, images: newImages }))}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {disease ? "Lưu thay đổi" : "Tạo bệnh mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
