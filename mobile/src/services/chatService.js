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
const recordTiming = async (id, ms, sessionContext, signal) => {
  const response = await api.patch(`/chat/${id}/timing`, { client_response_ms: ms }, { sessionContext, signal });
  return response.data;
};

export default { sendMessage, loadHistory, recordTiming };
