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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Flag, Loader2 } from "lucide-react";

function BlogReportDialog({
  loading,
  onOpenChange,
  onReasonChange,
  onSubmit,
  open,
  reason,
  reasons,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Báo cáo bài viết</DialogTitle>
            <DialogDescription>
              Chọn lý do phù hợp để Plantify xem xét bài viết này.
            </DialogDescription>
          </DialogHeader>
          <RadioGroup value={reason} onValueChange={onReasonChange} className="gap-3">
            {reasons.map((item) => (
              <Label
                key={item.value}
                htmlFor={`report-${item.value}`}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-green-100 p-3 text-sm hover:bg-green-50"
              >
                <RadioGroupItem id={`report-${item.value}`} value={item.value} />
                <span>{item.label}</span>
              </Label>
            ))}
          </RadioGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading || !reason}>
              {loading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Flag className="h-4 w-4" />}
              Gửi báo cáo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { BlogReportDialog };
