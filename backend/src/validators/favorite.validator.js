const v = require("./common");

const query = (input = {}) => {
  v.object(input, "query");
  const page = v.positiveInteger(input.page, 1, "page");
  const limit = v.positiveInteger(input.limit, 20, "limit", 100);
  if (!Number.isSafeInteger((page - 1) * limit)) v.invalid("page");
  return { page, limit };
};

const ids = (value) => {
  if (typeof value !== "string" || !value) v.invalid("ids", "Cần danh sách mã cây.");
  const values = value.split(",");
  if (values.length > 100) v.invalid("ids", "Chỉ kiểm tra tối đa 100 cây mỗi lần.");
  return [...new Set(values.map((id) => v.id(id, "ids").toLowerCase()))];
};

module.exports = { query, ids };
