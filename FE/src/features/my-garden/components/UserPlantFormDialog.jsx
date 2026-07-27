// UserPlantFormDialog.jsx - Tách form thông tin cây khỏi khu vực Album và CareEvent
import { useEffect, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserPlantAlbum } from "./UserPlantAlbum";
import { UserPlantCareEvents } from "./UserPlantCareEvents";
import { buildUserPlantPayload, getApiErrorMessage, isValidAlbumFile, removePendingPreview, revokePendingPreviews } from "../myGarden.utils";

const NO_CATALOG_VALUE = "none";
const EMPTY_FORM = { name: "", catalogPlantId: "", notes: "" };
const getReferenceId = (value) => !value ? "" : typeof value === "object" ? value._id || value.id || "" : value;

export function UserPlantFormDialog({ open, onOpenChange, userPlant, catalogPlants, catalogLoading, catalogError, saving, onSubmit, onUserPlantChanged }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [workingPlant, setWorkingPlant] = useState(null);
  const fileInputRef = useRef(null);
  const pendingFilesRef = useRef([]);
  const editing = Boolean(userPlant?._id);
  const userPlantSaving = saving || submitting;

  const clearPendingFiles = () => {
    revokePendingPreviews(pendingFilesRef.current);
    pendingFilesRef.current = [];
    setPendingFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploadProgress(0);
  };
  useEffect(() => { pendingFilesRef.current = pendingFiles; }, [pendingFiles]);
  useEffect(() => {
    if (!open) { clearPendingFiles(); return; }
    clearPendingFiles();
    setForm(userPlant ? { name: userPlant.name || "", catalogPlantId: getReferenceId(userPlant.catalogPlantId), notes: userPlant.notes || "" } : EMPTY_FORM);
    setWorkingPlant(userPlant || null);
    setFormError("");
  }, [open, userPlant]);
  useEffect(() => () => revokePendingPreviews(pendingFilesRef.current), []);

  const handleUserPlantSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || userPlantSaving) { if (!form.name.trim()) setFormError("Tên cây là bắt buộc."); return; }
    setSubmitting(true); setFormError("");
    try {
      await onSubmit(buildUserPlantPayload(form), pendingFiles.map((item) => item.file), setUploadProgress);
      onOpenChange(false);
    } catch (error) {
      setFormError(getApiErrorMessage(error, editing ? "Không thể cập nhật cây." : "Không thể tạo cây."));
    } finally { setSubmitting(false); setUploadProgress(0); }
  };
  const selectFiles = (event) => {
    const files = Array.from(event.target.files || []); event.target.value = "";
    const valid = files.filter(isValidAlbumFile).map((file) => ({ file, preview: URL.createObjectURL(file) }));
    if (valid.length !== files.length) setFormError("Chỉ nhận JPG, PNG, WebP và tối đa 5MB mỗi ảnh.");
    setPendingFiles((current) => [...current, ...valid]);
  };
  const handleAlbumChanged = (plant) => { setWorkingPlant(plant); onUserPlantChanged?.(plant); };

  return <Dialog open={open} onOpenChange={(nextOpen) => { if (!userPlantSaving) onOpenChange(nextOpen); }}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader><DialogTitle>{editing ? "Chỉnh sửa cây" : "Thêm cây vào My Garden"}</DialogTitle><DialogDescription>Thông tin cây, album và lịch sử chăm sóc hoạt động độc lập.</DialogDescription></DialogHeader>

      <form data-testid="user-plant-form" className="space-y-4 rounded-xl border p-4" onSubmit={handleUserPlantSubmit}>
        <div className="space-y-2"><Label htmlFor="user-plant-name">Tên cây *</Label><Input id="user-plant-name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required autoFocus /></div>
        <div className="space-y-2"><Label>Liên kết catalogue</Label><Select value={form.catalogPlantId || NO_CATALOG_VALUE} onValueChange={(value) => setForm((current) => ({ ...current, catalogPlantId: value === NO_CATALOG_VALUE ? "" : value }))} disabled={catalogLoading}><SelectTrigger><SelectValue placeholder="Chọn cây trong catalogue" /></SelectTrigger><SelectContent><SelectItem value={NO_CATALOG_VALUE}>Không liên kết catalogue</SelectItem>{catalogPlants.map((plant) => <SelectItem key={plant._id} value={plant._id}>{plant.name}</SelectItem>)}</SelectContent></Select>{catalogError ? <p className="text-xs text-destructive">{catalogError}</p> : null}</div>
        <div className="space-y-2"><Label htmlFor="user-plant-notes">Ghi chú</Label><Textarea id="user-plant-notes" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows={3} /></div>
        {formError ? <p className="rounded bg-destructive/10 p-3 text-sm text-destructive">{formError}</p> : null}
        <DialogFooter><Button type="button" variant="outline" disabled={userPlantSaving} onClick={() => onOpenChange(false)}>Hủy</Button><Button type="submit" disabled={userPlantSaving}>{userPlantSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{editing ? "Lưu UserPlant" : "Tạo cây"}</Button></DialogFooter>
      </form>

      {!editing ? <section data-testid="user-plant-create-images" className="space-y-3 rounded-xl border p-4"><div className="flex justify-between"><h3 className="font-medium">Ảnh cây</h3><input ref={fileInputRef} className="hidden" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={selectFiles} /><Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={userPlantSaving}>Chọn ảnh</Button></div>{pendingFiles.length ? <div className="grid grid-cols-3 gap-2">{pendingFiles.map((item, index) => <div key={item.preview} className="relative"><img src={item.preview} alt="Ảnh chờ tải" className="aspect-square w-full rounded object-cover" /><Button type="button" size="icon" className="absolute right-1 top-1 h-6 w-6" onClick={() => setPendingFiles((current) => removePendingPreview(current, index))}><X className="h-3 w-3" /></Button></div>)}</div> : null}{submitting && pendingFiles.length ? <p className="text-sm text-primary">Đang tải ảnh {uploadProgress}%</p> : null}</section> : null}
      {editing && workingPlant ? <div data-testid="user-plant-independent-sections" className="space-y-4"><UserPlantAlbum userPlant={workingPlant} onChanged={handleAlbumChanged} /><UserPlantCareEvents userPlantId={workingPlant._id} userPlantCreatedAt={workingPlant.createdAt} /></div> : null}
    </DialogContent>
  </Dialog>;
}
