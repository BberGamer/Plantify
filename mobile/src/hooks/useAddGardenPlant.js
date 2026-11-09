import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import gardenService from "../services/gardenService";
import plantService from "../services/plantService";
import useScreenScope from "./useScreenScope";
import getErrorMessage from "../utils/getErrorMessage";
import useAuthStore from "../../store/authStore";
import { validateGardenDate } from "../utils/gardenDate";

const emptyDraft = () => ({ plant_nickname: "", custom_species_name: "", placement_location: "", pot_type_size: "", acquisition_date: "" });

export default function useAddGardenPlant(plantId, gardenPlantId) {
  const router = useRouter();
  const editing = gardenPlantId !== undefined;
  const [draft, setDraft] = useState(emptyDraft);
  const [plant, setPlant] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const initialized = useRef(false);
  const loadRequest = useRef(0);
  const sessionVersion = useAuthStore((state) => state.sessionVersion);
  useEffect(() => {
    initialized.current = false;
    setDraft(emptyDraft());
    setPlant(null);
    setPhoto(null);
    setPhotoRemoved(false);
    setErrors({});
  }, [plantId, gardenPlantId, sessionVersion]);
  const { capture, isActive } = useScreenScope(() => { setBusy(pending.current); load(); }, undefined, gardenPlantId || plantId);

  async function load() {
    if (!isActive()) return;
    const request = ++loadRequest.current;
    const inScope = capture();
    const current = () => inScope() && request === loadRequest.current;
    setLoading(true);
    setError("");
    try {
      const response = editing ? await gardenService.getPlant(gardenPlantId) : plantId ? await plantService.getPlantById(plantId) : null;
      if ((editing || plantId) && (!response?.success || !response.data?._id)) throw new Error("Dữ liệu cây không hợp lệ.");
      if (!current()) return;
      if (editing) {
        if (response.data.archived_at) throw new Error("Không thể sửa cây đã lưu trữ.");
        setPlant(response.data);
        if (!initialized.current) setDraft({
          plant_nickname: response.data.plant_nickname || "",
          custom_species_name: response.data.custom_species_name || response.data.species_name || "",
          placement_location: response.data.placement_location || "",
          pot_type_size: response.data.pot_type_size || "",
          acquisition_date: response.data.acquisition_date || "",
        });
      } else if (plantId) {
        setPlant(response.data);
        if (!initialized.current) setDraft((value) => ({ ...value, plant_nickname: response.data.common_name }));
      }
      initialized.current = true;
    } catch (failure) {
      if (current()) setError(getErrorMessage(failure, "Không thể tải thông tin cây."));
    } finally { if (current()) setLoading(false); }
  }
  const change = (field, value) => {
    if (pending.current || !Object.prototype.hasOwnProperty.call(draft, field)) return;
    setDraft((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
  };
  async function choosePhoto() {
    if (pending.current || !isActive()) return;
    pending.current = true;
    setBusy(true);
    const current = capture();
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 1 });
      if (!current() || result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) throw new Error("Không đọc được ảnh đã chọn.");
      if ((asset.fileSize || 0) > 10 * 1024 * 1024) { setError("Ảnh tối đa 10 MB."); return; }
      if (asset.mimeType && !["image/jpeg", "image/png"].includes(asset.mimeType)) { setError("Vui lòng chọn ảnh JPG hoặc PNG."); return; }
      setPhoto(asset);
      setPhotoRemoved(false);
      setError("");
    } catch (failure) { if (current()) setError(getErrorMessage(failure, "Không thể chọn ảnh.")); }
    finally { pending.current = false; if (isActive()) setBusy(false); }
  }
  async function save() {
    if (pending.current || loading || !isActive() || !initialized.current) return;
    const fields = Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, value.trim()]));
    const invalid = {};
    for (const [field, max] of Object.entries({ plant_nickname: 150, custom_species_name: 200, placement_location: 200, pot_type_size: 200 })) {
      if (fields[field].length > max) invalid[field] = `Tối đa ${max} ký tự.`;
    }
    if (!fields.plant_nickname) invalid.plant_nickname = "Vui lòng nhập biệt danh cây.";
    const libraryPlant = editing ? !!plant?.plant_id : !!plantId;
    if (!libraryPlant && !fields.custom_species_name) invalid.custom_species_name = "Vui lòng nhập loài cây.";
    if (fields.acquisition_date) {
      const dateError = validateGardenDate(fields.acquisition_date);
      if (dateError) invalid.acquisition_date = dateError;
    } else if (editing) fields.acquisition_date = null;
    else delete fields.acquisition_date;
    setErrors(invalid);
    if (Object.keys(invalid).length) return;
    if (libraryPlant) {
      delete fields.custom_species_name;
      if (!editing) fields.plant_id = plantId;
    }
    if (editing && photoRemoved && !photo) fields.plant_image_url = "";
    pending.current = true;
    setBusy(true);
    setError("");
    const current = capture();
    try {
      const response = editing ? await gardenService.updatePlant(gardenPlantId, fields, photo) : await gardenService.createPlant(fields, photo);
      if (!response?.success || !response.data?._id) throw new Error("Phản hồi lưu cây không hợp lệ.");
      if (current()) {
        if (editing) router.back();
        else router.replace({ pathname: "/customer/garden", params: { addedPlant: response.data._id } });
      }
    } catch (failure) {
      if (current()) {
        const fieldErrors = failure.response?.data?.errors;
        if (fieldErrors && typeof fieldErrors === "object") setErrors(fieldErrors);
        setError(getErrorMessage(failure, editing ? "Không thể cập nhật cây. Vui lòng thử lại." : "Không thể thêm cây. Vui lòng thử lại."));
      }
    }
    finally { pending.current = false; if (isActive()) setBusy(false); }
  }
  const libraryPlant = editing ? !!plant?.plant_id : !!plantId;
  const existingImage = editing ? (photoRemoved ? plant?.species_snapshot?.plant_image_url : plant?.display_image_url) : plant?.plant_image;
  return { draft, plant, photo, image: photo?.uri || existingImage, photoRemoved, canRemovePhoto: !!photo || (editing && !!plant?.plant_image_url && !photoRemoved),
    libraryPlant, editing, errors, error, loading, busy, change, choosePhoto, save, retry: load,
    removePhoto: () => { if (pending.current) return; if (photo) setPhoto(null); else setPhotoRemoved(true); },
    cancel: () => { if (!pending.current) router.back(); } };
}
