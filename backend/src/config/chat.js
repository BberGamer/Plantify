const AppError = require("../utils/app-error");

const getChatSettings = () => {
  const maxTokens = Number(process.env.AI_CHAT_MAX_TOKENS || 800);
  const historyPairs = Number(process.env.AI_CHAT_HISTORY_PAIRS ?? 3);
  if (!Number.isInteger(maxTokens) || maxTokens < 128 || maxTokens > 1200 ||
      !Number.isInteger(historyPairs) || historyPairs < 0 || historyPairs > 10)
    throw new AppError("AI_NOT_CONFIGURED", 503, "Cấu hình độ dài hội thoại AI chưa hợp lệ.");
  return { maxTokens, historyPairs };
};

const selectHistory = (history, message, historyPairs) => {
  let selected = historyPairs ? history.slice(-historyPairs * 2) : [];
  while (selected.length && selected.reduce((sum, item) => sum + item.content.length, message.length) > 6000)
    selected = selected.slice(2);
  return selected;
};

module.exports = { getChatSettings, selectHistory };
