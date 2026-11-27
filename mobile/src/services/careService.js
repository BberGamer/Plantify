import api from "./api";
export default {
  list: async (params) => (await api.get("/care-schedules", { params })).data,
  create: async (body) => (await api.post("/care-schedules", body)).data,
  preview: async ({ plantId, diagnosisId, candidateRank }) =>
    (await api.post("/care-schedules/preview", {
      plant_id: plantId,
      ...(diagnosisId && { diagnosis_id: diagnosisId }),
      ...(candidateRank !== undefined && { candidate_rank: candidateRank }),
    }, { timeout: 20000 })).data,
  apply: async (userPlantId, previewToken) =>
    (await api.post("/care-schedules/apply", {
      user_plant_id: userPlantId,
      preview_token: previewToken,
    })).data,
  complete: async (id, date) =>
    (await api.patch(`/care-schedules/${id}/complete`, { date })).data,
  remove: async (id) => (await api.delete(`/care-schedules/${id}`)).data,
};
