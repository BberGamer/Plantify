import api from "./api";

const sendMessage = async (message, history, sessionContext, signal, conversationId) => {
  const response = await api.post("/chat", { message, history,
    ...(conversationId && { conversation_id: conversationId }) }, {
    sessionContext,
    signal,
    timeout: 55000,
  });
  return response.data;
};

const loadHistory = async (sessionContext, signal, params = {}) => {
  const response = await api.get("/chat/history", { sessionContext, signal, params });
  return response.data;
};
const evaluate = async (id, sessionContext, signal) => {
  const response = await api.post(`/chat/${id}/evaluation`, {}, { sessionContext, signal, timeout: 100000 });
  return response.data;
};
const getEvaluation = async (id, sessionContext, signal) => {
  const response = await api.get(`/chat/${id}/evaluation`, { sessionContext, signal });
  return response.data;
};

export default { sendMessage, loadHistory, evaluate, getEvaluation };
