// UserPlantAlbum.jsx - Quản lý upload, caption, cover và xóa ảnh album của một cây
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteUserPlantImage, updateUserPlantImage, uploadUserPlantImage } from "../api";
import { getApiErrorMessage, handleUserPlantImageError } from "../myGarden.utils";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function UserPlantAlbum({ userPlant, onChanged }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [busyImageId, setBusyImageId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [captions, setCaptions] = useState({});
  const images = userPlant.albumImages || [];

  const notifyChange = (response) => onChanged(response.data);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_SIZE) {
      toast.error("Chỉ nhận JPG, PNG, WebP và dung lượng tối đa 5MB.");
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await uploadUserPlantImage(userPlant._id, formData, (uploadEvent) => {
        if (uploadEvent.total) setProgress(Math.round((uploadEvent.loaded * 100) / uploadEvent.total));
      });
      notifyChange(response);
      toast.success("Đã tải ảnh vào album.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể tải ảnh."));
    } finally { setUploading(false); setProgress(0); }
  };

  const updateImage = async (imageId, payload, successMessage) => {
    setBusyImageId(imageId);
    try {
      const response = await updateUserPlantImage(userPlant._id, imageId, payload);
      notifyChange(response);
      toast.success(successMessage);
    } catch (error) { toast.error(getApiErrorMessage(error, "Không thể cập nhật ảnh.")); }
    finally { setBusyImageId(""); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusyImageId(deleteTarget._id);
    try {
      const response = await deleteUserPlantImage(userPlant._id, deleteTarget._id);
      notifyChange(response);
      setDeleteTarget(null);
      toast.success("Đã xóa ảnh khỏi album.");
    } catch (error) { toast.error(getApiErrorMessage(error, "Không thể xóa ảnh.")); }
    finally { setBusyImageId(""); }
  };

  return (
    <section className="space-y-4 rounded-xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h3 className="font-semibold">Album ảnh</h3><p className="text-xs text-muted-foreground">JPG, PNG, WebP · tối đa 5MB mỗi ảnh</p></div>
        <input ref={fileInputRef} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} />
        <Button type="button" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
          {uploading ? `Đang tải ${progress}%` : "Tải ảnh"}
        </Button>
      </div>
      {images.length === 0 ? <p className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">Chưa có ảnh trong album.</p> : (
        <div className="grid gap-3 sm:grid-cols-2">
          {images.map((image) => {
            const isCover = userPlant.coverImageUrl === image.url;
            const isBusy = busyImageId === String(image._id);
            return <div key={image._id} className="overflow-hidden rounded-lg border">
              <button type="button" className="block w-full" onClick={() => setPreviewImage(image)} aria-label={`Xem ảnh lớn ${image.caption || userPlant.name}`}><img src={image.url} alt={image.caption || userPlant.name} onError={handleUserPlantImageError} className="aspect-video w-full object-cover" /></button>
              <div className="space-y-2 p-3">
                <input className="w-full rounded-md border px-2 py-1.5 text-sm" value={captions[image._id] ?? image.caption ?? ""} onChange={(event) => setCaptions((current) => ({ ...current, [image._id]: event.target.value }))} placeholder="Thêm chú thích" />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" disabled={isBusy} onClick={() => updateImage(image._id, { caption: captions[image._id] ?? image.caption ?? "" }, "Đã lưu chú thích.")}>Lưu chú thích</Button>
                  <Button type="button" size="sm" variant={isCover ? "secondary" : "outline"} disabled={isBusy || isCover} onClick={() => updateImage(image._id, { setAsCover: true }, "Đã đặt ảnh đại diện.")}><Star className="mr-1 h-3.5 w-3.5" />{isCover ? "Ảnh đại diện" : "Đặt làm cover"}</Button>
                  <Button type="button" size="sm" variant="outline" className="text-destructive" disabled={isBusy} onClick={() => setDeleteTarget(image)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </div>;
          })}
        </div>
      )}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open && !busyImageId) setDeleteTarget(null); }}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Xóa ảnh khỏi album?</AlertDialogTitle><AlertDialogDescription>Ảnh sẽ bị xóa khỏi album. Nếu đây là ảnh đại diện, ảnh kế tiếp sẽ được dùng thay thế.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={Boolean(busyImageId)}>Hủy</AlertDialogCancel><AlertDialogAction disabled={Boolean(busyImageId)} onClick={(event) => { event.preventDefault(); confirmDelete(); }} className="bg-destructive text-destructive-foreground">Xóa ảnh</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
      <Dialog open={Boolean(previewImage)} onOpenChange={(open) => { if (!open) setPreviewImage(null); }}>
        <DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>{previewImage?.caption || "Ảnh album"}</DialogTitle></DialogHeader><img src={previewImage?.url} alt={previewImage?.caption || userPlant.name} onError={handleUserPlantImageError} className="max-h-[70vh] w-full rounded-lg object-contain" /></DialogContent>
      </Dialog>
    </section>
  );
}
