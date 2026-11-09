const v = require("./common");
const roles = ["customer", "manager", "admin"];
const role = (value) => {
  const result = v.text(value, "role").toLowerCase();
  if (!roles.includes(result)) v.invalid("role", "Vai trò không hợp lệ.");
  return result;
};
const update = (input) => {
  v.object(input);
  const result = {};
  if (input.fullName !== undefined)
    result.fullName = v.text(input.fullName, "fullName");
  if (input.phone !== undefined) result.phone = v.phone(input.phone);
  if (input.role !== undefined) result.role = role(input.role);
  if (input.status !== undefined)
    result.status = v.boolean(input.status, "status");
  return result;
};
const query = (input = {}) => {
  v.object(input, "query");
  const result = {
    ...input,
    page: v.positiveInteger(input.page, 1, "page"),
    limit: v.positiveInteger(input.limit, 10, "limit", 100),
  };
  if (!Number.isSafeInteger((result.page - 1) * result.limit))
    v.invalid("page");
  if (input.search !== undefined)
    result.search = v.text(input.search, "search", false);
  if (input.role !== undefined && input.role !== "")
    result.role = role(input.role);
  if (input.status !== undefined && input.status !== "")
    result.status = v.boolean(input.status, "status");
  if (
    input.sortBy !== undefined &&
    !["createdAt", "fullName", "email", "role", "status"].includes(input.sortBy)
  )
    v.invalid("sortBy");
  if (
    input.sortOrder !== undefined &&
    !["asc", "desc"].includes(input.sortOrder)
  )
    v.invalid("sortOrder");
  return result;
};
const create = (input) => {
  v.object(input);
  return {
    fullName: v.text(input.fullName, "fullName"),
    email: v.email(input.email),
    phone: input.phone === undefined ? "" : v.phone(input.phone),
    password: v.password(input.password),
    role: input.role === undefined ? "customer" : role(input.role),
  };
};
module.exports = { role, update, query, create };
