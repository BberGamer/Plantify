import api from "./api";

const treatmentService = {
  getApprovedProtocols: async (diseaseId) => {
    const response = await api.get("/treatments/protocols", {
      params: { disease_id: diseaseId },
    });
    return response.data;
  },

  generateSchedule: async ({
    userPlantId,
    diseaseId,
    treatmentProtocolId,
    diagnosisId,
    startDate,
  }) => {
    const payload = {
      user_plant_id: userPlantId,
      disease_id: diseaseId,
      treatment_protocol_id: treatmentProtocolId,
    };
    if (diagnosisId) payload.diagnosis_id = diagnosisId;
    if (startDate) payload.start_date = startDate;
    const response = await api.post("/treatments/schedules", payload);
    return response.data;
  },

  getSchedule: async (id) => {
    const response = await api.get(`/treatments/schedules/${id}`);
    return response.data;
  },

  activateSchedule: async (id) => {
    const response = await api.post(`/treatments/schedules/${id}/activate`);
    return response.data;
  },

  completeTask: async (scheduleId, taskId) => {
    const response = await api.patch(
      `/treatments/schedules/${scheduleId}/tasks/${taskId}/complete`,
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
};

export default treatmentService;
