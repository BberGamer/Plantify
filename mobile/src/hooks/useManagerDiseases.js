// useManagerDiseases.js - Quản lý danh sách và thao tác CRUD bệnh cây.
import { useCallback, useEffect, useRef, useState } from "react";
import diseaseService from "../services/diseaseService";
import plantService from "../services/plantService";
import getErrorMessage from "../utils/getErrorMessage";

const createDiseaseForm = (disease = {}) => ({
  disease_name: disease.disease_name || "",
  scientific_name: disease.scientific_name || "",
  pathogen_type: disease.pathogen_type || "other",
  typical_symptoms: disease.typical_symptoms || "",
  environmental_cause: disease.environmental_cause || "",
  disease_image_url: disease.disease_image_url || "",
  status: disease.status || "active",
  treatment_protocol:
    disease.treatment_protocol && typeof disease.treatment_protocol === "object"
      ? { ...disease.treatment_protocol }
      : {},
  plant_ids: Array.isArray(disease.plants)
    ? disease.plants.map((plant) => plant._id)
    : [],
});

const createDiseasePayload = (form) => ({
  disease_name: form.disease_name.trim(),
  scientific_name: form.scientific_name.trim(),
  pathogen_type: form.pathogen_type,
  typical_symptoms: form.typical_symptoms.trim(),
  environmental_cause: form.environmental_cause.trim(),
  disease_image_url: form.disease_image_url.trim(),
  status: form.status,
  treatment_protocol: { ...form.treatment_protocol },
  plant_ids: [...form.plant_ids],
});

export default function useManagerDiseases() {
  const [diseases, setDiseases] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listError, setListError] = useState("");
  const [plantOptions, setPlantOptions] = useState([]);
  const [plantsLoading, setPlantsLoading] = useState(true);
  const [plantsError, setPlantsError] = useState("");
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(createDiseaseForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const mounted = useRef(false);
  const listRequest = useRef(0);
  const plantRequest = useRef(0);
  const detailRequest = useRef(0);
  const searchValue = useRef("");
  const statusValue = useRef("");
  const searchTimer = useRef(null);
  const mutationPending = useRef(false);

  const loadDiseases = useCallback(async (refresh = false) => {
    clearTimeout(searchTimer.current);
    const requestId = ++listRequest.current;
    const isCurrent = () =>
      mounted.current && requestId === listRequest.current;
    setLoading(!refresh);
    setRefreshing(refresh);
    setListError("");
    try {
      const response = await diseaseService.getManagerDiseases({
        search: searchValue.current.trim(),
        status: statusValue.current,
        limit: 100,
      });
      if (!response?.success || !Array.isArray(response.data?.diseases)) {
        throw new Error(
          response?.message || "Dữ liệu danh sách bệnh cây không hợp lệ.",
        );
      }
      if (!isCurrent()) return;
      setDiseases(response.data.diseases);
      setTotal(response.data.total ?? response.data.diseases.length);
    } catch (error) {
      if (isCurrent()) {
        setListError(
          getErrorMessage(error, "Không tải được danh sách bệnh cây."),
        );
      }
    } finally {
      if (isCurrent()) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  const loadPlantOptions = useCallback(async () => {
    const requestId = ++plantRequest.current;
    const isCurrent = () =>
      mounted.current && requestId === plantRequest.current;
    setPlantsLoading(true);
    setPlantsError("");
    try {
      const response = await plantService.getManagerPlants({ limit: 100 });
      if (!response?.success || !Array.isArray(response.data?.plants)) {
        throw new Error(
          response?.message || "Dữ liệu danh sách cây không hợp lệ.",
        );
      }
      if (isCurrent()) setPlantOptions(response.data.plants);
    } catch (error) {
      if (isCurrent()) {
        setPlantsError(getErrorMessage(error, "Không tải được danh sách cây."));
      }
    } finally {
      if (isCurrent()) setPlantsLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    loadDiseases();
    loadPlantOptions();
    return () => {
      mounted.current = false;
      ++listRequest.current;
      ++plantRequest.current;
      ++detailRequest.current;
      clearTimeout(searchTimer.current);
    };
  }, [loadDiseases, loadPlantOptions]);

  const changeSearch = (value) => {
    setSearch(value);
    searchValue.current = value;
    ++listRequest.current;
    clearTimeout(searchTimer.current);
    setLoading(true);
    setRefreshing(false);
    setListError("");
    searchTimer.current = setTimeout(() => loadDiseases(), 400);
  };

  const changeStatusFilter = (value) => {
    statusValue.current = value;
    setStatusFilter(value);
    ++listRequest.current;
    clearTimeout(searchTimer.current);
    loadDiseases();
  };

  const openCreate = () => {
    if (mutationPending.current) return;
    ++detailRequest.current;
    setEditing(null);
    setForm(createDiseaseForm());
    setFormLoading(false);
    setFormReady(true);
    setFormError("");
    setVisible(true);
  };

  const loadDiseaseForEdit = async (disease) => {
    const requestId = ++detailRequest.current;
    setEditing(disease);
    setForm(createDiseaseForm(disease));
    setFormLoading(true);
    setFormReady(false);
    setFormError("");
    setVisible(true);
    try {
      const response = await diseaseService.getManagerDiseaseById(disease._id);
      if (!response?.success || !response.data) {
        throw new Error(response?.message || "Dữ liệu bệnh cây không hợp lệ.");
      }
      if (!mounted.current || requestId !== detailRequest.current) return;
      setEditing(response.data);
      setForm(createDiseaseForm(response.data));
      setFormReady(true);
    } catch (error) {
      if (mounted.current && requestId === detailRequest.current) {
        setFormError(
          getErrorMessage(error, "Không tải được thông tin bệnh cây."),
        );
      }
    } finally {
      if (mounted.current && requestId === detailRequest.current) {
        setFormLoading(false);
      }
    }
  };

  const openEdit = (disease) => {
    if (mutationPending.current) return;
    loadDiseaseForEdit(disease);
  };

  const retryEdit = () => {
    if (editing && !formLoading && !mutationPending.current) {
      loadDiseaseForEdit(editing);
    }
  };

  const closeForm = () => {
    if (mutationPending.current) return;
    ++detailRequest.current;
    setVisible(false);
    setEditing(null);
    setForm(createDiseaseForm());
    setFormLoading(false);
    setFormReady(false);
    setFormError("");
  };

  const changeField = (key, value) => {
    if (mutationPending.current || formLoading) return;
    setForm((previous) => ({ ...previous, [key]: value }));
    setFormError("");
  };

  const changeTreatmentField = (key, value) => {
    if (mutationPending.current || formLoading) return;
    setForm((previous) => ({
      ...previous,
      treatment_protocol: { ...previous.treatment_protocol, [key]: value },
    }));
    setFormError("");
  };

  const togglePlant = (plantId) => {
    if (mutationPending.current || formLoading) return;
    setForm((previous) => ({
      ...previous,
      plant_ids: previous.plant_ids.includes(plantId)
        ? previous.plant_ids.filter((id) => id !== plantId)
        : [...previous.plant_ids, plantId],
    }));
    setFormError("");
  };

  const save = async () => {
    if (mutationPending.current || !visible || formLoading || !formReady)
      return;
    if (!form.disease_name.trim() || !form.typical_symptoms.trim()) {
      setFormError("Vui lòng nhập tên bệnh và triệu chứng điển hình.");
      return;
    }
    if (form.plant_ids.length === 0) {
      setFormError("Vui lòng chọn ít nhất một cây liên quan.");
      return;
    }

    mutationPending.current = true;
    setSaving(true);
    setFormError("");
    try {
      const payload = createDiseasePayload(form);
      const response = editing
        ? await diseaseService.updateDisease(editing._id, payload)
        : await diseaseService.createDisease(payload);
      if (!response?.success) {
        throw new Error(response?.message || "Không lưu được bệnh cây.");
      }
      if (!mounted.current) return;
      setVisible(false);
      setEditing(null);
      setForm(createDiseaseForm());
      setFormReady(false);
      await loadDiseases(true);
    } catch (error) {
      if (mounted.current) {
        setFormError(getErrorMessage(error, "Không lưu được bệnh cây."));
      }
    } finally {
      mutationPending.current = false;
      if (mounted.current) setSaving(false);
    }
  };

  const requestDelete = (disease) => {
    if (mutationPending.current) return;
    setDeleteTarget(disease);
    setDeleteError("");
  };

  const closeDelete = () => {
    if (mutationPending.current) return;
    setDeleteTarget(null);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (mutationPending.current || !deleteTarget) return;
    const targetId = deleteTarget._id;
    mutationPending.current = true;
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await diseaseService.deleteDisease(targetId);
      if (!response?.success) {
        throw new Error(response?.message || "Không xóa được bệnh cây.");
      }
      if (!mounted.current) return;
      setDeleteTarget(null);
      setDiseases((previous) =>
        previous.filter((disease) => disease._id !== targetId),
      );
      setTotal((previous) => Math.max(0, previous - 1));
      await loadDiseases(true);
    } catch (error) {
      if (mounted.current) {
        setDeleteError(getErrorMessage(error, "Không xóa được bệnh cây."));
      }
    } finally {
      mutationPending.current = false;
      if (mounted.current) setDeleting(false);
    }
  };

  return {
    diseases,
    total,
    search,
    statusFilter,
    loading,
    refreshing,
    listError,
    plantOptions,
    plantsLoading,
    plantsError,
    visible,
    editing,
    form,
    formLoading,
    formReady,
    formError,
    saving,
    deleteTarget,
    deleting,
    deleteError,
    changeSearch,
    changeStatusFilter,
    refresh: () => loadDiseases(true),
    retry: () => loadDiseases(),
    retryPlants: loadPlantOptions,
    retryEdit,
    openCreate,
    openEdit,
    closeForm,
    changeField,
    changeTreatmentField,
    togglePlant,
    save,
    requestDelete,
    closeDelete,
    confirmDelete,
  };
}
