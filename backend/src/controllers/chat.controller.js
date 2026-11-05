const validate = require("../validators/chat.validator");
const chat = require("../services/chat.service");
const { success } = require("../utils/api-response");
const history = require("../services/chatHistory.service");
const evaluation = require("../services/chatEvaluation.service");

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
const evaluate = async (req, res, next) => {
  try { return success(res, "Kết quả đánh giá.", await evaluation.evaluate(req.user.id, req.params.id)); }
  catch (error) { next(error); }
};
const getEvaluation = async (req, res, next) => {
  try {
    await history.assertActive(req.user.id);
    const turn = await history.getTurn(req.user.id, req.params.id);
    return success(res, "Kết quả đánh giá.", turn.evaluation || { status: "not_requested" });
  } catch (error) { next(error); }
};

module.exports = { send, list, evaluate, getEvaluation };
