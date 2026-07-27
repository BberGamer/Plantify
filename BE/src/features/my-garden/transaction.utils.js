const mongoose = require('mongoose');

/** Nhận diện lỗi MongoDB deployment không hỗ trợ transaction. @param {Object} error - Lỗi MongoDB. @returns {boolean} Kết quả nhận diện. */
function isTransactionUnsupported(error) {
  return error?.code === 20
    || error?.codeName === 'IllegalOperation'
    || /Transaction numbers are only allowed|does not support transactions/i.test(
      error?.message || ''
    );
}

/** Chạy callback trong transaction bắt buộc và luôn đóng session. @param {Function} work - Công việc nhận session. @param {string} message - Thông báo khi transaction không hỗ trợ. @returns {Promise<*>} Kết quả callback. @throws {Error} Khi transaction hoặc callback thất bại. */
async function runRequiredTransaction(work, message) {
  let session;
  try {
    session = await mongoose.startSession();
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } catch (error) {
    if (isTransactionUnsupported(error)) {
      const transactionError = new Error(message);
      transactionError.statusCode = 503;
      transactionError.cause = error;
      throw transactionError;
    }
    throw error;
  } finally {
    await session?.endSession();
  }
}

module.exports = {
  isTransactionUnsupported,
  runRequiredTransaction,
};
