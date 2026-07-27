// UserPlantFormDialog.jsx - Form dùng chung để thêm và sửa cây trong My Garden
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  buildUserPlantPayload,
  getApiErrorMessage,
} from "../myGarden.utils";

const NO_CATALOG_VALUE = "none";
const EMPTY_FORM = {
  name: "",
  catalogPlantId: "",
  coverImageUrl: "",
  notes: "",
};

function getReferenceId(reference) {
  if (!reference) return "";
  return typeof reference === "object"
    ? reference._id || reference.id || ""
    : reference;
}

export function UserPlantFormDialog({
  open,
  onOpenChange,
  userPlant,
  catalogPlants,
  catalogLoading,
  catalogError,
  saving,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const isEditing = Boolean(userPlant?._id);

  useEffect(() => {
    if (!open) return;

    setForm(userPlant
      ? {
        name: userPlant.name || "",
        catalogPlantId: getReferenceId(userPlant.catalogPlantId),
        coverImageUrl: userPlant.coverImageUrl || "",
        notes: userPlant.notes || "",
      }
      : EMPTY_FORM);
    setFormError("");
  }, [open, userPlant]);

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setFormError("Tên cây là bắt buộc.");
      return;
    }

    setFormError("");
    try {
      await onSubmit(buildUserPlantPayload({ ...form, name }));
      onOpenChange(false);
    } catch (error) {
      setFormError(getApiErrorMessage(
        error,
        isEditing ? "Không thể cập nhật cây." : "Không thể thêm cây."
      ));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!saving) onOpenChange(nextOpen);
    }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa cây" : "Thêm cây vào My Garden"}
          </DialogTitle>
          <DialogDescription>
            Catalogue là tùy chọn; bạn vẫn có thể lưu một cây riêng của mình.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="user-plant-name">Tên cây *</Label>
            <Input
              id="user-plant-name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="VD: Monstera phòng khách"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-plant-catalog">Liên kết catalogue</Label>
            <Select
              value={form.catalogPlantId || NO_CATALOG_VALUE}
              onValueChange={(value) => updateField(
                "catalogPlantId",
                value === NO_CATALOG_VALUE ? "" : value
              )}
              disabled={catalogLoading}
            >
              <SelectTrigger id="user-plant-catalog">
                <SelectValue placeholder="Chọn cây trong catalogue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CATALOG_VALUE}>
                  Không liên kết catalogue
                </SelectItem>
                {catalogPlants.map((plant) => (
                  <SelectItem key={plant._id} value={plant._id}>
                    {plant.name}
                    {plant.scientificName ? ` — ${plant.scientificName}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {catalogLoading ? (
              <p className="text-xs text-muted-foreground">
                Đang tải catalogue...
              </p>
            ) : null}
            {catalogError ? (
              <p className="text-xs text-destructive">{catalogError}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-plant-cover">URL ảnh đại diện</Label>
            <Input
              id="user-plant-cover"
              value={form.coverImageUrl}
              onChange={(event) => updateField(
                "coverImageUrl",
                event.target.value
              )}
              placeholder="https://... hoặc /uploads/..."
            />
            <p className="text-xs text-muted-foreground">
              Nếu để trống, hệ thống dùng ảnh từ catalogue.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-plant-notes">Ghi chú</Label>
            <Textarea
              id="user-plant-notes"
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Vị trí đặt cây, tình trạng hiện tại..."
              rows={4}
              className="resize-none"
            />
          </div>

          {formError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {formError}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isEditing ? "Lưu thay đổi" : "Thêm cây"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
