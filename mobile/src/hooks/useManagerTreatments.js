import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useAuthStore from "../../store/authStore";
import diseaseService from "../services/diseaseService";
import plantService from "../services/plantService";
import treatmentService from "../services/treatmentService";
import getErrorMessage from "../utils/getErrorMessage";

const emptyStage = (order = 1) => ({
  order,
  title: "",
  start_day: String(order),
  end_day: String(order),
  instructions: "",
  dosage_note: "",
  important_note: "",
});

const emptyForm = () => ({
  protocol_name: "",
  disease_id: "",
  plant_ids: [],
  description: "",
  duration_days: "14",
  approved_instructions: "",
  safety_guidelines: "",
  status: "draft",
  stages: [emptyStage()],
});

const lines = (value) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const toForm = (item) => ({
  protocol_name: item.protocol_name || "",
  disease_id: item.disease_id?._id || item.disease_id || "",
  plant_ids: (item.plant_ids || []).map((plant) => plant._id || plant),
  description: item.description || "",
  duration_days: String(item.duration_days || 14),
  approved_instructions: (item.approved_instructions || []).join("\n"),
  safety_guidelines: (item.safety_guidelines || []).join("\n"),
  status: item.status === "approved" ? "approved" : "draft",
  stages: (item.stages || []).map((stage, index) => ({
    order: index + 1,
    title: stage.title || "",
    start_day: String(stage.start_day || index + 1),
    end_day: String(stage.end_day || index + 1),
    instructions: (stage.instructions || []).join("\n"),
    dosage_note: stage.dosage_note || "",
    important_note: stage.important_note || "",
  })),
});

const payload = (form) => ({
  protocol_name: form.protocol_name.trim(),
  disease_id: form.disease_id,
  plant_ids: form.plant_ids,
  description: form.description.trim(),
  duration_days: Number(form.duration_days),
  approved_instructions: lines(form.approved_instructions),
  safety_guidelines: lines(form.safety_guidelines),
  status: form.status,
  stages: form.stages.map((stage, index) => ({
    order: index + 1,
    title: stage.title.trim(),
    start_day: Number(stage.start_day),
    end_day: Number(stage.end_day),
    instructions: lines(stage.instructions),
    dosage_note: stage.dosage_note.trim(),
    important_note: stage.important_note.trim(),
  })),
});

const collectPages = async (fetchPage) => {
  const items = [];
  let page = 1;
  let totalPages = 1;
  do {
    const response = await fetchPage(page);
    const pageItems = response?.data?.items;
    if (response?.success !== true || !Array.isArray(pageItems))
      throw new Error("Dữ liệu phân trang không hợp lệ.");
    items.push(...pageItems);
    totalPages = response.data.pagination?.totalPages ?? response.data.totalPages;
    if (!Number.isSafeInteger(totalPages) || totalPages < 0)
      throw new Error("Dữ liệu phân trang không hợp lệ.");
    page += 1;
  } while (page <= totalPages);
  return items;
};

export default function useManagerTreatments() {
  const sessionVersion = useAuthStore((state) => state.sessionVersion);
  const [items, setItems] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deprecatingId, setDeprecatingId] = useState("");
  const request = useRef(0);
  const mutation = useRef(false);

  const load = useCallback(async () => {
    const requestId = ++request.current;
    setLoading(true);
    setError("");
    try {
      const [protocolItems, diseaseItems, plantItems] = await Promise.all([
        collectPages((page) =>
          treatmentService.getManagerProtocols({ page, limit: 100 }),
        ),
        collectPages((page) =>
          diseaseService.getManagerDiseases({ page, limit: 100 }),
        ),
        collectPages((page) =>
          plantService.getManagerPlants({ page, limit: 100 }),
        ),
      ]);
      if (requestId !== request.current) return;
      setItems(protocolItems);
      setDiseases(diseaseItems);
      setPlants(plantItems);
    } catch (failure) {
      if (requestId === request.current)
        setError(getErrorMessage(failure, "Không thể tải dữ liệu phác đồ điều trị."));
    } finally {
      if (requestId === request.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    return () => {
      request.current += 1;
    };
  }, [load, sessionVersion]);

  const eligiblePlants = useMemo(() => {
    const disease = diseases.find((item) => item._id === form.disease_id);
    const linkedIds = new Set((disease?.plant_ids || disease?.plants || []).map((item) => item._id || item));
    return linkedIds.size ? plants.filter((plant) => linkedIds.has(plant._id)) : plants;
  }, [diseases, form.disease_id, plants]);

  const openCreate = () => {
    if (mutation.current) return;
    setEditing(null);
    setForm(emptyForm());
    setFormError("");
    setVisible(true);
  };

  const openEdit = (item) => {
    if (mutation.current) return;
    setEditing(item);
    setForm(toForm(item));
    setFormError("");
    setVisible(true);
  };

  const close = () => {
    if (mutation.current) return;
    setVisible(false);
    setEditing(null);
    setForm(emptyForm());
    setFormError("");
  };

  const changeField = (key, value) => {
    if (mutation.current) return;
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "disease_id" ? { plant_ids: [] } : {}),
    }));
    setFormError("");
  };

  const togglePlant = (id) => {
    if (mutation.current) return;
    setForm((current) => ({
      ...current,
      plant_ids: current.plant_ids.includes(id)
        ? current.plant_ids.filter((value) => value !== id)
        : [...current.plant_ids, id],
    }));
  };

  const changeStage = (index, key, value) => {
    if (mutation.current) return;
    setForm((current) => ({
      ...current,
      stages: current.stages.map((stage, stageIndex) =>
        stageIndex === index ? { ...stage, [key]: value } : stage,
      ),
    }));
    setFormError("");
  };

  const addStage = () =>
    setForm((current) => ({
      ...current,
      stages: [...current.stages, emptyStage(current.stages.length + 1)],
    }));

  const removeStage = (index) => {
    if (form.stages.length <= 1 || mutation.current) return;
    setForm((current) => ({
      ...current,
      stages: current.stages
        .filter((_, stageIndex) => stageIndex !== index)
        .map((stage, stageIndex) => ({ ...stage, order: stageIndex + 1 })),
    }));
  };

  const moveStage = (index, direction) => {
    if (mutation.current) return;
    const target = index + direction;
    if (target < 0 || target >= form.stages.length) return;
    setForm((current) => {
      const stages = [...current.stages];
      [stages[index], stages[target]] = [stages[target], stages[index]];
      return {
        ...current,
        stages: stages.map((stage, stageIndex) => ({
          ...stage,
          order: stageIndex + 1,
        })),
      };
    });
  };

  const save = async () => {
    if (mutation.current) return;
    const data = payload(form);
    if (
      !data.protocol_name ||
      !data.disease_id ||
      !data.description ||
      !Number.isInteger(data.duration_days) ||
      data.duration_days < 1 ||
      !data.plant_ids.length ||
      !data.safety_guidelines.length ||
      data.stages.some(
        (stage) =>
          !stage.title ||
          !stage.instructions.length ||
          !Number.isInteger(stage.start_day) ||
          !Number.isInteger(stage.end_day) ||
          stage.start_day < 1 ||
          stage.end_day < stage.start_day ||
          stage.end_day > data.duration_days,
      ) ||
      (data.status === "approved" && !data.approved_instructions.length)
    ) {
      setFormError(
        "Vui lòng điền đủ thông tin, cây áp dụng, hướng dẫn an toàn và ngày hợp lệ cho từng giai đoạn.",
      );
      return;
    }
    mutation.current = true;
    setSaving(true);
    setFormError("");
    try {
      const response = editing
        ? await treatmentService.updateProtocol(editing._id, data)
        : await treatmentService.createProtocol(data);
      if (response?.success !== true) throw new Error("Không thể lưu phác đồ.");
      setVisible(false);
      setEditing(null);
      setForm(emptyForm());
      await load();
    } catch (failure) {
      setFormError(getErrorMessage(failure, "Không thể lưu phác đồ điều trị."));
    } finally {
      mutation.current = false;
      setSaving(false);
    }
  };

  const deprecate = async (id) => {
    if (mutation.current) return;
    mutation.current = true;
    setDeprecatingId(id);
    try {
      const response = await treatmentService.deprecateProtocol(id);
      if (response?.success !== true) throw new Error("Không thể ngừng phác đồ.");
      await load();
    } catch (failure) {
      setError(getErrorMessage(failure, "Không thể ngừng sử dụng phác đồ."));
    } finally {
      mutation.current = false;
      setDeprecatingId("");
    }
  };

  return {
    items,
    diseases,
    eligiblePlants,
    loading,
    error,
    visible,
    editing,
    form,
    formError,
    saving,
    deprecatingId,
    refresh: load,
    openCreate,
    openEdit,
    close,
    changeField,
    togglePlant,
    changeStage,
    addStage,
    removeStage,
    moveStage,
    save,
    deprecate,
  };
}
