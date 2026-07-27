import { Loader2, Plus, X, GripVertical, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

function CareGuideFields({ form, handleSubmit, isOpen, loading, plantName, setForm, setIsOpen }) {
  return (
<Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Thêm Care Guide cho {plantName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cg-watering">Tưới nước</Label>
              <Textarea id="cg-watering" value={form.watering} onChange={(e) => setForm((p) => ({ ...p, watering: e.target.value }))} rows={3} placeholder="VD: Tưới mỗi 1–2 tuần" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cg-propagation">Nhân giống</Label>
              <Textarea id="cg-propagation" value={form.propagation} onChange={(e) => setForm((p) => ({ ...p, propagation: e.target.value }))} rows={3} placeholder="VD: Giâm cành trong đất ẩm" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cg-pruning">Cắt tỉa</Label>
            <Textarea id="cg-pruning" value={form.pruning} onChange={(e) => setForm((p) => ({ ...p, pruning: e.target.value }))} rows={3} placeholder="Loại bỏ lá già, lá vàng và cành yếu" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cg-repotting">Thay chậu</Label>
            <Textarea id="cg-repotting" value={form.repotting} onChange={(e) => setForm((p) => ({ ...p, repotting: e.target.value }))} rows={3} placeholder="VD: Thay chậu 1–2 năm/lần" />
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
}

export { CareGuideFields };
