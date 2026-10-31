const validate = require("../validators/chat.validator");
const chat = require("../services/chat.service");
const { success } = require("../utils/api-response");

const send = async (req, res, next) => {
  try {
    const input = validate.chat(req.body);
    const result = await chat.send(req.user.id, input);
    return success(res, "Trả lời thành công.", result);
  } catch (error) {
    next(error);
  }
};

module.exports = { send };
