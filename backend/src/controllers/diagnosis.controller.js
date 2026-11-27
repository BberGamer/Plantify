const diagnosis = require("../services/diagnosis.service");
const { success } = require("../utils/api-response");
const AppError = require("../utils/app-error");

const analyze =
  (identification = false) =>
  async (req, res, next) => {
    const controller = new AbortController();
    const abort = () => controller.abort();
    const disconnected = () => {
      if (!res.writableEnded) abort();
    };
    req.once("aborted", abort);
    res.once("close", disconnected);
    try {
      const data = await diagnosis.diagnose(req.file, {
        signal: controller.signal,
        identification,
        userId: req.user.id,
        userPlantId: req.query.user_plant_id,
      });
      if (!controller.signal.aborted && !res.destroyed)
        return success(res, data.message, data);
    } catch (error) {
      if (!controller.signal.aborted) next(error);
    } finally {
      req.removeListener("aborted", abort);
      res.removeListener("close", disconnected);
    }
  };

const history = async (req, res, next) => {
  try {
    return success(
      res,
      "Lấy lịch sử chẩn đoán thành công.",
      await diagnosis.history(req.user.id, req.query),
    );
  } catch (error) {
    next(error);
  }
};

const historyDetail = async (req, res, next) => {
  try {
    return success(
      res,
      "Lấy chi tiết chẩn đoán thành công.",
      await diagnosis.historyDetail(req.user.id, req.params.diagnosisId),
    );
  } catch (error) {
    next(error);
  }
};
const historyImage = async (req, res, next) => {
  try {
    const image = await diagnosis.historyImage(
      req.user.id,
      req.params.diagnosisId,
    );
    res.set({
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    });
    if (Buffer.isBuffer(image)) return res.type("image/jpeg").send(image);
    res.sendFile(image, (error) => {
      if (error)
        next(
          error.code === "ENOENT"
            ? new AppError(
                "DIAGNOSIS_IMAGE_NOT_FOUND",
                404,
                "Ảnh chẩn đoán không còn khả dụng.",
              )
            : error,
        );
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  predict: analyze(),
  identify: analyze(true),
  history,
  historyDetail,
  historyImage,
};
