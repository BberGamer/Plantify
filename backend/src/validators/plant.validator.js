const v = require("./common");
const fields = [
  "category_id",
  "common_name",
  "scientific_name",
  "botanical_family",
  "description",
  "plant_image",
  "care_requirements",
  "common_disease_ids",
  "is_published",
];
const payload = (input, creating = false) => {
  v.object(input);
  const result = {};
  for (const field of fields)
    if (input[field] !== undefined) result[field] = input[field];
  for (const field of ["common_name", "scientific_name"]) {
    if (creating || result[field] !== undefined)
      result[field] = v.text(result[field], field);
  }
  if (creating || result.category_id !== undefined)
    result.category_id = v.id(result.category_id, "category_id");
  for (const field of ["botanical_family", "description", "plant_image"]) {
    if (result[field] !== undefined)
      result[field] = v.text(result[field], field, false);
  }
  if (
    result.is_published !== undefined &&
    typeof result.is_published !== "boolean"
  )
    v.invalid("is_published");
  if (result.care_requirements !== undefined) {
    v.object(result.care_requirements, "care_requirements");
    // Mixed chưa có schema con; giữ dữ liệu và chặn khóa cập nhật MongoDB.
    const checkKeys = (value) => {
      if (!value || typeof value !== "object") return;
      for (const key of Object.keys(value)) {
        if (
          key.startsWith("$") ||
          key.includes(".") ||
          ["__proto__", "constructor", "prototype"].includes(key)
        )
          v.invalid("care_requirements");
        checkKeys(value[key]);
      }
    };
    checkKeys(result.care_requirements);
  }
  if (result.common_disease_ids !== undefined) {
    if (!Array.isArray(result.common_disease_ids))
      v.invalid("common_disease_ids");
    result.common_disease_ids = result.common_disease_ids.map((value) =>
      v.id(value, "common_disease_ids"),
    );
  }
  return result;
};
const query = (input = {}) => {
  v.object(input, "query");
  const result = {
    page: v.positiveInteger(input.page, 1, "page"),
    limit: v.positiveInteger(input.limit, 20, "limit"),
  };
  if (!Number.isSafeInteger((result.page - 1) * result.limit))
    v.invalid("page");
  if (input.search !== undefined)
    result.search = v.text(input.search, "search", false);
  if (input.category_id !== undefined && input.category_id !== "")
    result.category_id = v.id(input.category_id, "category_id");
  return result;
};
module.exports = { payload, query };
