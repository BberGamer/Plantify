// useManagerPlants.js - Quản lý danh sách, tìm kiếm và form cây của Manager.
import { useCallback, useEffect, useRef, useState } from "react";
import plantService from "../services/plantService";

const CARE_FIELDS = ["light", "water", "temperature", "humidity"];

const createPlantForm = (plant = {}) => ({
  category_id: plant.category_id?._id || plant.category_id || "",
  common_name: plant.common_name || "",
  scientific_name: plant.scientific_name || "",
  botanical_family: plant.botanical_family || "",
  description: plant.description || "",
  plant_image: plant.plant_image || "",
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
  return {
    category_id: form.category_id,
    common_name: form.common_name.trim(),
    scientific_name: form.scientific_name.trim(),
    botanical_family: form.botanical_family.trim(),
    description: form.description.trim(),
    plant_image: form.plant_image.trim(),
    care_requirements: careRequirements,
    common_disease_ids: plant?.common_disease_ids || [],
    is_published: form.is_published,
  };
};

/** Quản lý state và các thao tác CRUD; component chỉ nhận dữ liệu và callback. */
export default function useManagerPlants() {
  const [plants, setPlants] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listError, setListError] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(createPlantForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const mounted = useRef(false);
  const listRequest = useRef(0);
  const categoryRequest = useRef(0);
  const searchValue = useRef("");
  const searchTimer = useRef(null);
  const mutationPending = useRef(false);

  const loadPlants = useCallback(async (refresh = false) => {
    clearTimeout(searchTimer.current);
    const requestId = ++listRequest.current;
    const isCurrent = () =>
      mounted.current && requestId === listRequest.current;
    setLoading(!refresh);
    setRefreshing(refresh);
    setListError("");
    try {
      const response = await plantService.getManagerPlants({
        search: searchValue.current.trim(),
        limit: 100,
      });
      if (!response?.success || !Array.isArray(response.data?.plants)) {
        throw new Error(
          response?.message || "Dữ liệu danh sách cây không hợp lệ.",
        );
      }
      if (!isCurrent()) return;
      setPlants(response.data.plants);
      setTotal(response.data.total ?? response.data.plants.length);
    } catch (error) {
      if (isCurrent()) {
        setListError(
          error.response?.data?.message ||
            error.message ||
            "Không tải được danh sách cây.",
        );
      }
    } finally {
      if (isCurrent()) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  const loadCategories = useCallback(async () => {
    const requestId = ++categoryRequest.current;
    const isCurrent = () =>
      mounted.current && requestId === categoryRequest.current;
    setCategoriesLoading(true);
    setCategoriesError("");
    try {
      const response = await plantService.getCategories();
      if (!response?.success || !Array.isArray(response.data)) {
        throw new Error(response?.message || "Dữ liệu danh mục không hợp lệ.");
      }
      if (isCurrent()) setCategories(response.data);
    } catch (error) {
      if (isCurrent()) {
        setCategoriesError(
          error.response?.data?.message ||
            error.message ||
            "Không tải được danh mục cây.",
        );
      }
    } finally {
      if (isCurrent()) setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    loadPlants();
    loadCategories();
    return () => {
      mounted.current = false;
      ++listRequest.current;
      ++categoryRequest.current;
      clearTimeout(searchTimer.current);
    };
  }, [loadPlants, loadCategories]);

  const changeSearch = (value) => {
    setSearch(value);
    searchValue.current = value;
    // Vô hiệu response cũ ngay khi gõ, kể cả trong thời gian chờ debounce.
    ++listRequest.current;
    clearTimeout(searchTimer.current);
    setLoading(true);
    setRefreshing(false);
    setListError("");
    searchTimer.current = setTimeout(() => loadPlants(), 400);
  };

  const openCreate = () => {
    if (mutationPending.current) return;
    setEditing(null);
    setForm(createPlantForm({ category_id: categories[0]?._id || "" }));
    setFormError("");
    setVisible(true);
  };

  const openEdit = (plant) => {
    if (mutationPending.current) return;
    setEditing(plant);
    setForm(createPlantForm(plant));
    setFormError("");
    setVisible(true);
  };

  const closeForm = () => {
    if (mutationPending.current) return;
    setVisible(false);
    setEditing(null);
    setForm(createPlantForm());
    setFormError("");
  };

  const changeField = (key, value) => {
    if (mutationPending.current) return;
    setForm((previous) => ({ ...previous, [key]: value }));
    setFormError("");
  };

  const changeCareField = (key, value) => {
    if (mutationPending.current) return;
    setForm((previous) => ({
      ...previous,
      care_requirements: { ...previous.care_requirements, [key]: value },
    }));
    setFormError("");
  };

  const save = async () => {
    if (mutationPending.current || !visible) return;
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
      const payload = createPlantPayload(form, editing);
      const response = editing
        ? await plantService.updatePlant(editing._id, payload)
        : await plantService.createPlant(payload);
      if (!response?.success)
        throw new Error(response?.message || "Không lưu được cây.");
      if (!mounted.current) return;
      setVisible(false);
      setEditing(null);
      setForm(createPlantForm());
      await loadPlants(true);
    } catch (error) {
      if (mounted.current) {
        setFormError(
          error.response?.data?.message ||
            error.message ||
            "Không lưu được cây.",
        );
      }
    } finally {
      mutationPending.current = false;
      if (mounted.current) setSaving(false);
    }
  };

  const requestDelete = (plant) => {
    if (mutationPending.current) return;
    setDeleteTarget(plant);
    setDeleteError("");
  };

  const closeDelete = () => {
    if (mutationPending.current) return;
    setDeleteTarget(null);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (mutationPending.current || !deleteTarget) return;
    mutationPending.current = true;
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await plantService.deletePlant(deleteTarget._id);
      if (!response?.success)
        throw new Error(response?.message || "Không xóa được cây.");
      if (!mounted.current) return;
      setDeleteTarget(null);
      // Loại ngay cây đã xóa để không còn xuất hiện nếu tải lại gặp lỗi.
      setPlants((previous) =>
        previous.filter((plant) => plant._id !== deleteTarget._id),
      );
      setTotal((previous) => Math.max(0, previous - 1));
      await loadPlants(true);
    } catch (error) {
      if (mounted.current) {
        setDeleteError(
          error.response?.data?.message ||
            error.message ||
            "Không xóa được cây.",
        );
      }
    } finally {
      mutationPending.current = false;
      if (mounted.current) setDeleting(false);
    }
  };

  return {
    plants,
    total,
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
