const mongoose = require("mongoose");

const withTransactionResult = async (operation, options) => {
  let result;
  await mongoose.connection.transaction(async (session) => {
    result = await operation(session);
  }, options);
  return result;
};

module.exports = withTransactionResult;
