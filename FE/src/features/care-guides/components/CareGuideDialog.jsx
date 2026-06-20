import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const EMPTY_FORM = {
  plantId: "",
  watering: "",
  propagation: "",
  pruning: "",
  repotting: "",
};

export function CareGuideDialog({ open, onOpenChange, careGuide, plants, loading, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    setForm(careGuide ? {
      plantId: careGuide.plantId || "",
      watering: careGuide.watering || "",
      propagation: careGuide.propagation || "",
      pruning: careGuide.pruning || "",
      repotting: careGuide.repotting || "",
    } : EMPTY_FORM);
  }, [careGuide, open]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{careGuide ? "Chỉnh sửa hướng dẫn" : "Tạo hướng dẫn mới"}</DialogTitle>
          <DialogDescription>
            Điền hướng dẫn chăm sóc ngắn gọn, rõ ràng cho từng loại cây.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="care-guide-plant">Loài cây *</Label>
            <Select value={form.plantId} onValueChange={(value) => updateField("plantId", value)}>
              <SelectTrigger id="care-guide-plant" className="w-full">
                <SelectValue placeholder="Chọn cây cần tạo hướng dẫn" />
              </SelectTrigger>
              <SelectContent>
                {plants.map((plant) => {
                  const plantId = plant._id;
                  return (
                    <SelectItem key={plantId} value={plantId}>
                      {plant.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="care-guide-watering">Tưới nước</Label>
              <Textarea
                id="care-guide-watering"
                value={form.watering}
                onChange={(event) => updateField("watering", event.target.value)}
                placeholder="VD: Tưới mỗi 1–2 tuần, để đất khô giữa các lần tưới."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="care-guide-propagation">Nhân giống</Label>
              <Textarea
                id="care-guide-propagation"
                value={form.propagation}
                onChange={(event) => updateField("propagation", event.target.value)}
                placeholder="VD: Giâm thân có mắt trong nước hoặc đất ẩm."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="care-guide-pruning">Cắt tỉa</Label>
              <Textarea
                id="care-guide-pruning"
                value={form.pruning}
                onChange={(event) => updateField("pruning", event.target.value)}
                placeholder="VD: Loại bỏ lá vàng và cắt trên mắt lá."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="care-guide-repotting">Thay chậu</Label>
              <Textarea
                id="care-guide-repotting"
                value={form.repotting}
                onChange={(event) => updateField("repotting", event.target.value)}
                placeholder="VD: Thay chậu 1–2 năm/lần vào đầu mùa xuân."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading || !form.plantId}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {careGuide ? "Lưu thay đổi" : "Tạo hướng dẫn"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
