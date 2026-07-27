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
import { ImageUploader } from "@/components/common/ImageUploader";

function DiseaseFields({ form, handleSubmit, isOpen, loading, plantName, setForm, setIsOpen }) {
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

          <div className="space-y-2">
            <Label>Hình ảnh bệnh cây</Label>
            <ImageUploader
              images={form.images}
              onChange={(newImages) => setForm((p) => ({ ...p, images: newImages }))}
            />
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
}

export { DiseaseFields };
