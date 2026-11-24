import api from "./api";

const treatmentService = {
  getApprovedProtocols: async (diseaseId, plantId) => {
    const response = await api.get("/treatments/protocols", {
      params: { disease_id: diseaseId, plant_id: plantId },
    });
    return response.data;
  },

  createPreview: async ({ diseaseId, plantId, diagnosisId }) => {
    const payload = { disease_id: diseaseId, plant_id: plantId };
    if (diagnosisId) payload.diagnosis_id = diagnosisId;
    return (await api.post("/treatments/preview", payload, { timeout: 70000 })).data;
  },

  generateSchedule: async ({
    userPlantId,
    diseaseId,
    previewToken,
    diagnosisId,
    startDate,
    scheduleId,
    sessionContext,
  }) => {
    const payload = {
      user_plant_id: userPlantId,
      disease_id: diseaseId,
      preview_token: previewToken,
    };
    if (diagnosisId) payload.diagnosis_id = diagnosisId;
    if (startDate) payload.start_date = startDate;
    if (scheduleId) payload.schedule_id = scheduleId;
    const response = await api.post("/treatments/schedules", payload, { sessionContext });
    return response.data;
  },

  getSchedule: async (id, sessionContext) => {
    const response = await api.get(`/treatments/schedules/${id}`, { sessionContext });
    return response.data;
  },

  activateSchedule: async (id, sessionContext) => {
    const response = await api.post(`/treatments/schedules/${id}/activate`, undefined, { sessionContext });
    return response.data;
  },

  completeTask: async (scheduleId, taskId) => {
    const response = await api.patch(
      `/treatments/schedules/${scheduleId}/tasks/${taskId}/complete`,
    );
    return response.data;
  },

  editTask: async (scheduleId, taskId, payload) => {
    const response = await api.patch(
      `/treatments/schedules/${scheduleId}/tasks/${taskId}`,
      payload,
    );
    return response.data;
  },

  finishSchedule: async (id, status, note) => {
    const response = await api.patch(`/treatments/schedules/${id}/finish`, {
      status,
      note,
    });
    return response.data;
  },

  getManagerProtocols: async (params = {}) =>
    (await api.get("/treatments/manager", { params })).data,

  createProtocol: async (payload) =>
    (await api.post("/treatments/manager", payload)).data,

  generateAiDraft: async ({ disease_id, plant_ids, document }) => {
    const form = new FormData();
    form.append("disease_id", disease_id);
    form.append("plant_ids", JSON.stringify(plant_ids));
    if (document) form.append("document", document.file || {
        uri: document.uri,
        name: document.name,
        type: document.mimeType || "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
    return (await api.post("/treatments/manager/ai-draft", form, {
      timeout: 70000,
      headers: { "Content-Type": "multipart/form-data" },
    })).data;
  },

  updateProtocol: async (id, payload) =>
    (await api.put(`/treatments/manager/${id}`, payload)).data,

  deprecateProtocol: async (id) =>
    (await api.patch(`/treatments/manager/${id}/deprecate`)).data,
};

export default treatmentService;
