// useManagerDiseases.js - Quản lý danh sách và thao tác CRUD bệnh cây.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import diseaseService from "../services/diseaseService";
import plantService from "../services/plantService";
import getErrorMessage from "../utils/getErrorMessage";
import useDebouncedValue from "./useDebouncedValue";
import useScreenScope from "./useScreenScope";
import useAuthStore from "../../store/authStore";

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
  const sessionVersion = useAuthStore((state) => state.sessionVersion);
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
  const mutationPending = useRef(false);
  const debounced = useDebouncedValue(search.trim());
  const listContext = useMemo(() => ({
    search: debounced.value, status: statusFilter, enabled: !debounced.pending,
  }), [debounced.value, statusFilter, debounced.pending]);
  const queryRef = useRef(listContext);
  queryRef.current = listContext;
  const { capture: captureList, isActive: isListActive } = useScreenScope(
    () => loadDiseases(), undefined, listContext,
  );
  const { capture, isActive } = useScreenScope(() => loadPlantOptions(), () => {
    ++detailRequest.current;
    setFormLoading(false);
  });

  const loadDiseases = useCallback(async (refresh = false) => {
    const query = queryRef.current;
    if (!isListActive() || !query.enabled) return;
    const inScope = captureList();
    const requestId = ++listRequest.current;
    const isCurrent = () =>
      inScope() && query === queryRef.current && requestId === listRequest.current;
    setLoading(!refresh);
    setRefreshing(refresh);
    setListError("");
    try {
      const response = await diseaseService.getManagerDiseases({
        search: query.search,
        status: query.status,
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
  }, [captureList, isListActive]);

  const loadPlantOptions = useCallback(async () => {
    if (!isActive()) return;
    const inScope = capture();
    const requestId = ++plantRequest.current;
    const isCurrent = () =>
      inScope() && requestId === plantRequest.current;
    setPlantsLoading(true);
    setPlantsError("");
    try {
      const plants = [];
      let page = 1;
      let totalPages = 1;
      do {
        const response = await plantService.getManagerPlants({
          page,
          limit: 100,
        });
        if (!isCurrent()) return;
        if (response.data.pagination.page !== page) {
          throw Object.assign(
            new Error("Dữ liệu phân trang cây không hợp lệ."),
            { code: "INVALID_RESPONSE" },
          );
        }
        plants.push(...response.data.items);
        totalPages = response.data.pagination.totalPages;
        page += 1;
      } while (page <= totalPages);
      if (isCurrent()) setPlantOptions(plants);
    } catch (error) {
      if (isCurrent()) {
        setPlantsError(getErrorMessage(error, "Không tải được danh sách cây."));
      }
    } finally {
      if (isCurrent()) setPlantsLoading(false);
    }
  }, [capture, isActive]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      ++listRequest.current;
      ++plantRequest.current;
      ++detailRequest.current;
    };
  }, []);

  useEffect(() => {
    setDiseases([]);
    setTotal(0);
    setPlantOptions([]);
    setVisible(false);
    setEditing(null);
    setForm(createDiseaseForm());
    setFormReady(false);
    setFormError("");
    setDeleteTarget(null);
    setDeleteError("");
  }, [sessionVersion]);

  const changeSearch = (value) => {
    setSearch(value);
    ++listRequest.current;
    setLoading(true);
    setRefreshing(false);
    setListError("");
    if (value.trim() === debounced.value && !debounced.pending) loadDiseases();
  };

  const changeStatusFilter = (value) => {
    if (value === statusFilter && !debounced.pending) return;
    setStatusFilter(value);
    ++listRequest.current;
    debounced.flush();
  };

  const openCreate = () => {
    if (mutationPending.current || deleteTarget || !isActive()) return;
    ++detailRequest.current;
    setEditing(null);
    setForm(createDiseaseForm());
    setFormLoading(false);
    setFormReady(true);
    setFormError("");
    setVisible(true);
  };

  const loadDiseaseForEdit = async (disease) => {
    if (!isActive()) return;
    const inScope = capture();
    const requestId = ++detailRequest.current;
    const isCurrent = () => inScope() && requestId === detailRequest.current;
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
      if (!isCurrent()) return;
      setEditing(response.data);
      setForm(createDiseaseForm(response.data));
      setFormReady(true);
    } catch (error) {
      if (isCurrent()) {
        setFormError(
          getErrorMessage(error, "Không tải được thông tin bệnh cây."),
        );
      }
    } finally {
      if (isCurrent()) {
        setFormLoading(false);
      }
    }
  };

  const openEdit = (disease) => {
    if (mutationPending.current || deleteTarget || !isActive()) return;
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
    if (mutationPending.current || !visible || formLoading || !formReady ||
        !Object.prototype.hasOwnProperty.call(form, key) ||
        ["plant_ids", "treatment_protocol"].includes(key)) return;
    setForm((previous) => ({ ...previous, [key]: value }));
    setFormError("");
  };

  const changeTreatmentField = (key, value) => {
    if (mutationPending.current || !visible || formLoading || !formReady) return;
    setForm((previous) => ({
      ...previous,
      treatment_protocol: { ...previous.treatment_protocol, [key]: value },
    }));
    setFormError("");
  };

  const togglePlant = (plantId) => {
    if (mutationPending.current || !visible || formLoading || !formReady) return;
    setForm((previous) => ({
      ...previous,
      plant_ids: previous.plant_ids.includes(plantId)
        ? previous.plant_ids.filter((id) => id !== plantId)
        : [...previous.plant_ids, plantId],
    }));
    setFormError("");
  };

  const save = async () => {
    if (mutationPending.current || !visible || formLoading || !formReady || !isActive())
      return;
    const isCurrent = capture();
    const limits = {
      disease_name: 150,
      scientific_name: 200,
      typical_symptoms: 5000,
      environmental_cause: 5000,
      disease_image_url: 2048,
    };
    if (
      Object.entries(limits).some(
        ([key, limit]) => form[key].trim().length > limit,
      )
    ) {
      setFormError("Nội dung vượt quá độ dài cho phép. Vui lòng kiểm tra lại.");
      return;
    }
    if (
      form.disease_image_url.trim() &&
      !/^https?:\/\/\S+$/i.test(form.disease_image_url.trim())
    ) {
      setFormError("URL ảnh bệnh phải là đường dẫn http hoặc https hợp lệ.");
      return;
    }
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
      if (!isCurrent()) return;
      setVisible(false);
      setEditing(null);
      setForm(createDiseaseForm());
      setFormReady(false);
      await loadDiseases(true);
    } catch (error) {
      if (isCurrent()) {
        setFormError(getErrorMessage(error, "Không lưu được bệnh cây."));
      }
    } finally {
      mutationPending.current = false;
      if (mounted.current) setSaving(false);
    }
  };

  const requestDelete = (disease) => {
    if (mutationPending.current || visible || !isActive()) return;
    setDeleteTarget(disease);
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
    const targetId = deleteTarget._id;
    mutationPending.current = true;
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await diseaseService.deleteDisease(targetId);
      if (!response?.success) {
        throw new Error(response?.message || "Không xóa được bệnh cây.");
      }
      if (!isCurrent()) return;
      setDeleteTarget(null);
      setDiseases((previous) =>
        previous.filter((disease) => disease._id !== targetId),
      );
      setTotal((previous) => Math.max(0, previous - 1));
      await loadDiseases(true);
    } catch (error) {
      if (isCurrent()) {
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
