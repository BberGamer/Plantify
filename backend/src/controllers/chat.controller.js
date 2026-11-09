const validate = require("../validators/chat.validator");
const chat = require("../services/chat.service");
const { success } = require("../utils/api-response");
const history = require("../services/chatHistory.service");
const benchmark = require("../services/chatBenchmark.service");

const send = async (req, res, next) => {
  try {
    const input = validate.chat(req.body);
    const result = await chat.send(req.user.id, input);
    return success(res, "Trả lời thành công.", result);
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try { return success(res, "Lấy lịch sử thành công.", await history.list(req.user.id, req.query)); }
  catch (error) { next(error); }
};
const recordTiming = async (req, res, next) => {
  try { return success(res, "Ghi nhận thời gian.", await benchmark.recordTiming(req.user.id, req.params.id, req.body)); }
  catch (error) { next(error); }
};
const exportReport = async (req, res, next) => {
  try {
    const csv = await benchmark.exportReport(req.user.id, req.query);
    return res.type("text/csv; charset=utf-8").attachment("Plantify_AI_Results.csv").send(csv);
  } catch (error) { next(error); }
};

module.exports = { send, list, recordTiming, exportReport };
