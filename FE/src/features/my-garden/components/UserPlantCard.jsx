// UserPlantCard.jsx - Card tóm tắt một cây trong My Garden
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getUserPlantImage, handleUserPlantImageError } from "../myGarden.utils";

export function UserPlantCard({
  userPlant,
  onView,
  onEdit,
  onDelete,
  deleting,
}) {
  const catalogPlant = userPlant.catalogPlantId
    && typeof userPlant.catalogPlantId === "object"
    ? userPlant.catalogPlantId
    : null;

  return (
    <Card className="group overflow-hidden bg-white/95 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <button
        type="button"
        className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        onClick={() => onView(userPlant)}
        aria-label={`Xem chi tiết ${userPlant.name}`}
      >
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={getUserPlantImage(userPlant)}
            alt={userPlant.name}
            onError={handleUserPlantImageError}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <CardContent className="space-y-3 p-4">
          <div>
            <h2 className="line-clamp-1 text-lg font-semibold">
              {userPlant.name}
            </h2>
            {catalogPlant ? (
              <p className="mt-1 line-clamp-1 text-xs text-primary">
                Catalogue: {catalogPlant.name}
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                Cây riêng, chưa liên kết catalogue
              </p>
            )}
          </div>
          <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
            {userPlant.notes || "Chưa có ghi chú cho cây này."}
          </p>
        </CardContent>
      </button>

      <CardFooter className="justify-end gap-2 border-t p-3">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onView(userPlant)}
        >
          <Eye className="mr-1 h-4 w-4" />
          Xem
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onEdit(userPlant)}
        >
          <Pencil className="mr-1 h-4 w-4" />
          Sửa
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(userPlant)}
          disabled={deleting}
          aria-label={`Xóa ${userPlant.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
