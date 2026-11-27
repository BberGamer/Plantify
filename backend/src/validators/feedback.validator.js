const validate = require("./common");
const { types, decisions } = require("../models/feedback.model");

function boundedText(value, field, max, label) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max)
    validate.invalid(field, `${label} là bắt buộc và tối đa ${max} ký tự.`);
  return value.trim();
}

function choice(value, field, values) {
  if (!values.includes(value)) validate.invalid(field);
  return value;
}

function date(value, field) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    validate.invalid(field, "Ngày phải có định dạng YYYY-MM-DD.");
  const utc = new Date(value + "T00:00:00.000Z");
  if (!Number.isFinite(utc.getTime()) || !utc.toISOString().startsWith(value))
    validate.invalid(field, "Ngày không hợp lệ.");
  return new Date(utc.getTime() - 7 * 60 * 60 * 1000);
}

function create(body, requestKey) {
  validate.object(body);
  if (
    typeof requestKey !== "string" ||
    !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(requestKey)
  )
    validate.invalid("request_key", "Mã yêu cầu gửi không hợp lệ.");
  return {
    description: boundedText(body.description, "description", 250, "Mô tả"),
    diagnosis_id:
      body.diagnosis_id === undefined || body.diagnosis_id === ""
        ? null
        : validate.id(body.diagnosis_id, "diagnosis_id"),
    request_key: requestKey.toLowerCase(),
  };
}

function list(query, manager) {
  const page = validate.positiveInteger(query.page, 1, "page");
  const limit = validate.positiveInteger(query.limit, 20, "limit", 50);
  if (!Number.isSafeInteger((page - 1) * limit)) validate.invalid("page");
  const filter = {};
  let email;
  if (query.type !== undefined) filter.type = choice(query.type, "type", types);
  if (query.status !== undefined)
    filter.status = choice(query.status, "status", ["pending", ...decisions]);
  if (manager) {
    if (query.email !== undefined) email = validate.email(query.email);
    const from = query.from === undefined ? null : date(query.from, "from");
    const to = query.to === undefined ? null : date(query.to, "to");
    if (from && to && from > to)
      validate.invalid("to", "Ngày kết thúc phải từ ngày bắt đầu trở đi.");
    if (from || to)
      filter.created_at = {
        ...(from ? { $gte: from } : {}),
        ...(to ? { $lt: new Date(to.getTime() + 86400000) } : {}),
      };
  }
  return { page, limit, filter, email };
}

function review(body) {
  validate.object(body);
  if (!Number.isSafeInteger(body.review_count) || body.review_count < 0)
    validate.invalid("review_count");
  return {
    status: choice(body.status, "status", decisions),
    response: boundedText(body.response, "response", 1000, "Nội dung phản hồi"),
    review_count: body.review_count,
  };
}

module.exports = { create, list, review };
