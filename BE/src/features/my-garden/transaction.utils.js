const mongoose = require('mongoose');

function isTransactionUnsupported(error) {
  return error?.code === 20
    || error?.codeName === 'IllegalOperation'
    || /Transaction numbers are only allowed|does not support transactions/i.test(
      error?.message || ''
    );
}

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
