// DeleteUserPlantDialog.jsx - Xác nhận xóa vĩnh viễn cây khỏi My Garden
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/** Hiển thị xác nhận xóa cây khỏi My Garden. @param {Object} props - Component props. @returns {JSX.Element} Dialog xác nhận xóa. */
export function DeleteUserPlantDialog({
  userPlant,
  open,
  onOpenChange,
  deleting,
  onConfirm,
}) {
  const handleConfirm = async (event) => {
    event.preventDefault();
    await onConfirm();
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!deleting) onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa cây khỏi My Garden?</AlertDialogTitle>
          <AlertDialogDescription>
            Cây “{userPlant?.name || ""}”, ảnh album và lịch sử chăm sóc sẽ
            bị xóa vĩnh viễn. Lịch sử chẩn đoán vẫn được giữ lại.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Xác nhận xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
