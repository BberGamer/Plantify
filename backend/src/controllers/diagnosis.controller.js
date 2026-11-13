const diagnosis = require("../services/diagnosis.service");
const { success } = require("../utils/api-response");

const predict = async (req, res, next) => {
  const controller = new AbortController();
  const abort = () => controller.abort();
  const disconnected = () => { if (!res.writableEnded) abort(); };
  req.once("aborted", abort);
  res.once("close", disconnected);
  try {
    const data = await diagnosis.diagnose(req.file, { signal: controller.signal });
    if (!controller.signal.aborted && !res.destroyed)
      return success(res, data.message, data);
  } catch (error) {
    if (!controller.signal.aborted) next(error);
  } finally {
    req.removeListener("aborted", abort);
    res.removeListener("close", disconnected);
  }
};

module.exports = { predict };
