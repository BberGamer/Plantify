import useRefreshOnResume from "./useRefreshOnResume";
import useCatalogAiLabels from "./useCatalogAiLabels";
import getErrorMessage from "../utils/getErrorMessage";
// useManagerPlants.js - Quản lý danh sách, tìm kiếm và form cây của Manager.
import { useCallback, useEffect, useRef, useState } from "react";
import plantService from "../services/plantService";
import usePaginatedList from "./usePaginatedList";
import useDebouncedValue from "./useDebouncedValue";
import useScreenScope from "./useScreenScope";
import useAuthStore from "../../store/authStore";
import { usePlantCategories } from "./usePlants";
import { catalogImageDraft, pickCatalogPhotos } from "../services/catalogImages";

const CARE_FIELDS = ["light", "water", "temperature", "humidity", "soil", "fertilizer"];

const createPlantForm = (plant = {}) => ({
  category_id: plant.category_id?._id || plant.category_id || "",
  common_name: plant.common_name || "",
  scientific_name: plant.scientific_name || "",
  botanical_family: plant.botanical_family || "",
  description: plant.description || "",
  images: catalogImageDraft(plant, plant.plant_image),
  imagesChanged: false,
  care_requirements: Object.fromEntries(
    CARE_FIELDS.map((key) => [
      key,
      typeof plant.care_requirements?.[key] === "string"
        ? plant.care_requirements[key]
        : "",
    ]),
  ),
  is_published: plant.is_published ?? true,
});

const createPlantPayload = (form, plant) => {
  // Giữ cả các trường chưa có ô chỉnh sửa, ví dụ soil và fertilizer.
  const careRequirements = { ...plant?.care_requirements };
  CARE_FIELDS.forEach((key) => {
    const value = form.care_requirements[key].trim();
    if (value) careRequirements[key] = value;
    else if (typeof careRequirements[key] === "string")
      delete careRequirements[key];
  });
  // Quan hệ bệnh được sửa ở màn bệnh; không gửi lại snapshot từ form cây.
  return {
    category_id: form.category_id,
    common_name: form.common_name.trim(),
    scientific_name: form.scientific_name.trim(),
    botanical_family: form.botanical_family.trim(),
    description: form.description.trim(),
    ...(form.imagesChanged ? { image_urls: form.images } : {}),
    care_requirements: careRequirements,
    is_published: form.is_published,
  };
};

/** Quản lý state và các thao tác CRUD; component chỉ nhận dữ liệu và callback. */
export default function useManagerPlants() {
  const sessionVersion = useAuthStore((state) => state.sessionVersion);
  const [search, setSearch] = useState("");
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    refetch: loadCategories,
  } = usePlantCategories();
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(createPlantForm);
  const ai = useCatalogAiLabels("plant", visible, editing?._id);
  const [formError, setFormError] = useState("");
  const [formReady, setFormReady] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const detailRequest = useRef(0);
  const [choosingPhoto, setChoosingPhoto] = useState(false);
  const photoPending = useRef(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const mounted = useRef(false);
  const mutationPending = useRef(false);
  const debounced = useDebouncedValue(search.trim());
  const { capture, isActive } = useScreenScope();

  const fetchPage = useCallback(
    (params) =>
      plantService.getManagerPlants({
        ...params,
        search: debounced.value,
      }),
    [debounced.value],
  );
  const plantList = usePaginatedList(fetchPage, {
    limit: 100,
    enabled: !debounced.pending,
  });
  useRefreshOnResume(plantList.refresh);
  const {
    items: plants,
    setItems: setPlants,
    pagination,
    loading,
    refreshing,
    error: listError,
  } = plantList;
  const loadPlants = useCallback(
    (refresh = false) => plantList.load(undefined, refresh),
    [plantList.load],
  );

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    ++detailRequest.current;
    setFormReady(false);
    setFormLoading(false);
    setVisible(false);
    setEditing(null);
    setForm(createPlantForm());
    setFormError("");
    setDeleteTarget(null);
    setDeleteError("");
  }, [sessionVersion]);

  const changeSearch = (value) => {
    setSearch(value);
    // Vô hiệu response cũ ngay khi gõ, kể cả trong thời gian chờ debounce.
    plantList.invalidate();
    if (value.trim() === debounced.value && !debounced.pending)
      plantList.load(1);
  };

  const openCreate = () => {
    if (
      mutationPending.current ||
      photoPending.current ||
      deleteTarget ||
      !isActive()
    )
      return;
    setEditing(null);
    ++detailRequest.current;
    setFormReady(true);
    setFormLoading(false);
    setForm(createPlantForm({ category_id: categories[0]?._id || "" }));
    setFormError("");
    setVisible(true);
  };

  const openEdit = async (plant) => {
    if (
      mutationPending.current ||
      photoPending.current ||
      deleteTarget ||
      !isActive()
    )
      return;
    const requestId = ++detailRequest.current;
    const inScope = capture();
    const current = () => requestId === detailRequest.current && inScope();
    setEditing(plant);
    setForm(createPlantForm(plant));
    setFormError("");
    setFormLoading(true);
    setFormReady(false);
    setVisible(true);
    try {
      const response = await plantService.getManagerPlantById(plant._id);
      if (!response?.success || !response.data) throw new Error("Invalid response");
      if (!current()) return;
      setEditing(response.data);
      setForm(createPlantForm(response.data));
      setFormReady(true);
    } catch (error) {
      if (current()) setFormError(getErrorMessage(error));
    } finally {
      if (current()) setFormLoading(false);
    }
  };

  const closeForm = () => {
    if (mutationPending.current || photoPending.current) return;
    ++detailRequest.current;
    setFormReady(false);
    setFormLoading(false);
    setVisible(false);
    setEditing(null);
    setForm(createPlantForm());
    setFormError("");
  };

  const changeField = (key, value) => {
    if (
      mutationPending.current ||
      !visible ||
      !Object.prototype.hasOwnProperty.call(form, key) ||
      key === "care_requirements"
    )
      return;
    setForm((previous) => ({
      ...previous,
      [key]: value,
      imagesChanged: previous.imagesChanged || key === "images",
    }));
    setFormError("");
  };

  const changeCareField = (key, value) => {
    if (mutationPending.current || !visible || !CARE_FIELDS.includes(key))
      return;
    setForm((previous) => ({
      ...previous,
      care_requirements: { ...previous.care_requirements, [key]: value },
    }));
    setFormError("");
  };

  const choosePhoto = async () => {
    if (
      mutationPending.current ||
      photoPending.current ||
      !visible ||
      !isActive()
    )
      return;
    photoPending.current = true;
    setChoosingPhoto(true);
    const current = capture();
    try {
      const images = await pickCatalogPhotos(form.images);
      if (!current() || !images.length) return;
      setForm((previous) => ({
        ...previous,
        images: [...previous.images, ...images],
        imagesChanged: true,
      }));
      setFormError("");
    } catch (error) {
      if (current())
        setFormError(
          getErrorMessage(error, "Không thể chọn ảnh. Vui lòng thử lại."),
        );
    } finally {
      photoPending.current = false;
      if (mounted.current) setChoosingPhoto(false);
    }
  };

  const save = async () => {
    if (!ai.ready || !formReady || formLoading) return;
    if (
      mutationPending.current ||
      photoPending.current ||
      !visible ||
      !isActive()
    )
      return;
    const isCurrent = capture();
    if (
      !form.common_name.trim() ||
      !form.scientific_name.trim() ||
      !form.category_id
    ) {
      setFormError(
        "Vui lòng nhập tên thường gọi, tên khoa học và chọn danh mục.",
      );
      return;
    }
    mutationPending.current = true;
    setSaving(true);
    setFormError("");
    try {
      const payload = { ...createPlantPayload(form, editing), ai_class_ids: ai.selected };
      const response = editing
        ? await plantService.updatePlant(editing._id, payload)
        : await plantService.createPlant(payload);
      if (!response?.success)
        throw new Error(response?.message || "Không lưu được cây.");
      if (!isCurrent()) return;
      setVisible(false);
      setEditing(null);
      setForm(createPlantForm());
      await loadPlants(true);
    } catch (error) {
      if (isCurrent()) {
        setFormError(getErrorMessage(error, "Không lưu được cây."));
      }
    } finally {
      mutationPending.current = false;
      if (mounted.current) setSaving(false);
    }
  };

  const requestDelete = (plant) => {
    if (mutationPending.current || visible || !isActive()) return;
    setDeleteTarget(plant);
    setDeleteError("");
  };

  const closeDelete = () => {
    if (mutationPending.current) return;
    setDeleteTarget(null);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (mutationPending.current || !deleteTarget || !isActive()) return;
    const isCurrent = capture();
    mutationPending.current = true;
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await plantService.deletePlant(deleteTarget._id);
      if (!response?.success)
        throw new Error(response?.message || "Không xóa được cây.");
      if (!isCurrent()) return;
      setDeleteTarget(null);
      // Loại ngay cây đã xóa để không còn xuất hiện nếu tải lại gặp lỗi.
      setPlants((previous) =>
        previous.filter((plant) => plant._id !== deleteTarget._id),
      );
      await loadPlants(true);
    } catch (error) {
      if (isCurrent()) {
        setDeleteError(getErrorMessage(error, "Không xóa được cây."));
      }
    } finally {
      mutationPending.current = false;
      if (mounted.current) setDeleting(false);
    }
  };

  return {
    ai,
    plants,
    total: pagination.total,
    pagination,
    changePage: (page) => plantList.load(page),
    search,
    loading,
    refreshing,
    listError,
    categories,
    categoriesLoading,
    categoriesError,
    visible,
    editing,
    form,
    formError,
    formReady,
    formLoading,
    retryEdit: () => editing && openEdit(editing),
    choosingPhoto,
    choosePhoto,
    saving,
    deleteTarget,
    deleting,
    deleteError,
    changeSearch,
    refresh: () => loadPlants(true),
    retry: () => loadPlants(),
    retryCategories: loadCategories,
    openCreate,
    openEdit,
    closeForm,
    changeField,
    changeCareField,
    save,
    requestDelete,
    closeDelete,
    confirmDelete,
  };
}
