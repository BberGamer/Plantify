// UserPlantDetailDialog.jsx - Dialog tải và hiển thị chi tiết một UserPlant
import { Loader2, Pencil, RefreshCw, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUserPlantDetail } from "../hooks";
import { DEFAULT_IMAGE, getUserPlantImage } from "../myGarden.utils";

export function UserPlantDetailDialog({
  open,
  onOpenChange,
  userPlantId,
  onEdit,
}) {
  const { userPlant, loading, error, refetch } = useUserPlantDetail(
    userPlantId,
    open
  );
  const catalogPlant = userPlant?.catalogPlantId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            Chi tiết cây
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang tải chi tiết...
          </div>
        ) : error ? (
          <div className="space-y-4 py-12 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button type="button" variant="outline" onClick={refetch}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Thử lại
            </Button>
          </div>
        ) : userPlant ? (
          <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
            <img
              src={getUserPlantImage(userPlant)}
              alt={userPlant.name}
              onError={(event) => {
                event.currentTarget.src = DEFAULT_IMAGE;
              }}
              className="aspect-square w-full rounded-xl border bg-muted object-cover"
            />
            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-primary">
                  My Garden
                </p>
                <h2 className="mt-1 text-2xl font-bold">{userPlant.name}</h2>
              </div>

              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Ghi chú
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm">
                  {userPlant.notes || "Chưa có ghi chú."}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Thông tin catalogue
                </p>
                {catalogPlant ? (
                  <div className="mt-2">
                    <p className="font-semibold">{catalogPlant.name}</p>
                    <p className="text-sm italic text-muted-foreground">
                      {catalogPlant.scientificName || "Chưa có tên khoa học"}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Cây này chưa liên kết với catalogue Plantify.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          {userPlant ? (
            <Button type="button" onClick={() => onEdit(userPlant)}>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
