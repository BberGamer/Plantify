import api from "./api";
export default {
  list: async (params) => (await api.get("/care-schedules", { params })).data,
  create: async (body) => (await api.post("/care-schedules", body)).data,
  generate: async (id, { diagnosisId, candidateRank } = {}) =>
    (await api.post("/care-schedules/generate", {
      user_plant_id: id,
      ...(diagnosisId && { diagnosis_id: diagnosisId }),
      ...(candidateRank !== undefined && { candidate_rank: candidateRank }),
    }, { timeout: 20000 })).data,
  complete: async (id, date) =>
    (await api.patch(`/care-schedules/${id}/complete`, { date })).data,
  remove: async (id) => (await api.delete(`/care-schedules/${id}`)).data,
};
