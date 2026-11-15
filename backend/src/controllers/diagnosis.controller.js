const diagnosis = require("../services/diagnosis.service");
const { success } = require("../utils/api-response");

// Mục đích: Điều phối request chẩn đoán ảnh.
// Cách chạy: Gọi service, trả kết quả và hủy cuộc gọi Python nếu client ngắt kết nối.
const predict = async (req, res, next) => {
  const controller = new AbortController();
  // Mục đích: Hủy cuộc gọi nhận diện đang chờ.
  // Cách chạy: Phát tín hiệu abort qua controller của request này.
  const abort = () => controller.abort();
  // Mục đích: Xử lý client đóng kết nối sớm.
  // Cách chạy: Chỉ hủy khi response chưa gửi xong.
  const disconnected = () => { if (!res.writableEnded) abort(); };
  req.once("aborted", abort);
  res.once("close", disconnected);
  try {
    const data = await diagnosis.diagnose(req.file, {
      signal: controller.signal,
      userId: req.user.id,
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

module.exports = { predict };
