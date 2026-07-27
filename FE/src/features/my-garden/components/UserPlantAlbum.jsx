// UserPlantAlbum.jsx - Hiển thị album ở chế độ chỉ xem hoặc cho phép quản lý ảnh trong form sửa
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { deleteUserPlantImage, updateUserPlantImage, uploadUserPlantImage } from "../api";
import { getAlbumCapabilities, getApiErrorMessage, handleUserPlantImageError, isValidAlbumFile } from "../myGarden.utils";

/** Quản lý hiển thị, upload, sửa và xóa ảnh album của cây. @param {Object} props - Component props. @param {Object} props.userPlant - Cây sở hữu album. @param {Function} props.onChanged - Callback khi cây thay đổi. @param {boolean} [props.readOnly=false] - Chế độ chỉ đọc. @returns {JSX.Element} Album cây. */
export function UserPlantAlbum({ userPlant, onChanged, readOnly = false }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [busyImageId, setBusyImageId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [captions, setCaptions] = useState({});
  const images = userPlant.albumImages || [];
  const capabilities = getAlbumCapabilities(readOnly);

  const notifyChange = (response) => onChanged?.(response.data);
  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []); event.target.value = "";
    const validFiles = files.filter(isValidAlbumFile);
    if (!validFiles.length) { toast.error("Chỉ nhận JPG, PNG, WebP và tối đa 5MB mỗi ảnh."); return; }
    if (validFiles.length !== files.length) toast.error("Một số ảnh không hợp lệ đã bị bỏ qua.");
    setUploading(true); setProgress(0);
    try {
      for (let index = 0; index < validFiles.length; index += 1) {
        const formData = new FormData(); formData.append("file", validFiles[index]);
        const response = await uploadUserPlantImage(userPlant._id, formData, (eventProgress) => {
          if (eventProgress.total) setProgress(Math.round(((index + eventProgress.loaded / eventProgress.total) / validFiles.length) * 100));
        });
        notifyChange(response);
      }
      toast.success("Đã tải ảnh vào album.");
    } catch (error) { toast.error(getApiErrorMessage(error, "Không thể tải ảnh.")); }
    finally { setUploading(false); setProgress(0); }
  };
  const updateImage = async (imageId, payload, message) => {
    setBusyImageId(String(imageId));
    try { notifyChange(await updateUserPlantImage(userPlant._id, imageId, payload)); toast.success(message); }
    catch (error) { toast.error(getApiErrorMessage(error, "Không thể cập nhật ảnh.")); }
    finally { setBusyImageId(""); }
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusyImageId(String(deleteTarget._id));
    try { notifyChange(await deleteUserPlantImage(userPlant._id, deleteTarget._id)); setDeleteTarget(null); toast.success("Đã xóa ảnh khỏi album."); }
    catch (error) { toast.error(getApiErrorMessage(error, "Không thể xóa ảnh.")); }
    finally { setBusyImageId(""); }
  };
  return <section className="space-y-4 rounded-xl border p-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">Album ảnh</h3><p className="text-xs text-muted-foreground">JPG, PNG, WebP · tối đa 5MB mỗi ảnh</p></div>{capabilities.canUpload && <><input ref={fileInputRef} className="hidden" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleUpload} /><Button type="button" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>{uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}{uploading ? `Đang tải ${progress}%` : "Tải ảnh"}</Button></>}</div>
    {images.length === 0 ? <p className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">Chưa có ảnh trong album.</p> : <div className="grid gap-3 sm:grid-cols-2">{images.map((image) => { const isCover = userPlant.coverImageUrl === image.url; const busy = busyImageId === String(image._id); return <div key={image._id} className="overflow-hidden rounded-lg border"><button type="button" className="block w-full" onClick={() => setPreviewImage(image)}><img src={image.url} alt={image.caption || userPlant.name} onError={handleUserPlantImageError} className="aspect-video w-full object-cover" /></button><div className="space-y-2 p-3">{readOnly ? <p className="text-sm text-muted-foreground">{image.caption || "Không có chú thích"}</p> : <><input className="w-full rounded-md border px-2 py-1.5 text-sm" value={captions[image._id] ?? image.caption ?? ""} onChange={(event) => setCaptions((current) => ({ ...current, [image._id]: event.target.value }))} placeholder="Thêm chú thích" /><div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => updateImage(image._id, { caption: captions[image._id] ?? image.caption ?? "" }, "Đã lưu chú thích.")}>Lưu chú thích</Button><Button type="button" size="sm" variant={isCover ? "secondary" : "outline"} disabled={busy || isCover} onClick={() => updateImage(image._id, { setAsCover: true }, "Đã đặt ảnh đại diện.")}><Star className="mr-1 h-3.5 w-3.5" />{isCover ? "Ảnh đại diện" : "Đặt cover"}</Button><Button type="button" size="sm" variant="outline" className="text-destructive" disabled={busy} onClick={() => setDeleteTarget(image)}><Trash2 className="h-3.5 w-3.5" /></Button></div></>}</div></div>; })}</div>}
    {!readOnly && <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open && !busyImageId) setDeleteTarget(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Xóa ảnh khỏi album?</AlertDialogTitle><AlertDialogDescription>Nếu là ảnh đại diện, ảnh kế tiếp sẽ được dùng thay thế.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction onClick={(event) => { event.preventDefault(); confirmDelete(); }} className="bg-destructive text-destructive-foreground">Xóa ảnh</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>}
    <Dialog open={Boolean(previewImage)} onOpenChange={(open) => { if (!open) setPreviewImage(null); }}><DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>{previewImage?.caption || "Ảnh album"}</DialogTitle></DialogHeader><img src={previewImage?.url} alt={previewImage?.caption || userPlant.name} onError={handleUserPlantImageError} className="max-h-[70vh] w-full rounded-lg object-contain" /></DialogContent></Dialog>
  </section>;
}
