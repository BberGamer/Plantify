import api from "./api";

const sendMessage = async (message, history, sessionContext, signal) => {
  const response = await api.post("/chat", { message, history }, {
    sessionContext,
    signal,
    timeout: 55000,
  });
  return response.data;
};

export default { sendMessage };
