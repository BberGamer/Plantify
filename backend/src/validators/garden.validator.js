const v = require("./common");

const stringLimits = {
  plant_nickname: 150, custom_species_name: 200, placement_location: 200,
  pot_type_size: 200, plant_image_url: 2048,
};
const fields = [...Object.keys(stringLimits), "plant_id", "category_id", "health_status", "acquisition_date"];

const payload = (input, creating = false) => {
  v.object(input);
  for (const key of Object.keys(input)) {
    if (!fields.includes(key) || (!creating && key === "plant_id"))
      v.invalid(key, `Không được cập nhật trường ${key}.`);
  }
  const result = {};
  for (const [field, maximum] of Object.entries(stringLimits)) {
    if (input[field] !== undefined || (creating && field === "plant_nickname")) {
      result[field] = v.text(input[field], field, ["plant_nickname", "custom_species_name"].includes(field));
      if (result[field].length > maximum) v.invalid(field, `Trường ${field} tối đa ${maximum} ký tự.`);
    }
  }
  if (result.plant_image_url && !/^https?:\/\/\S+$/i.test(result.plant_image_url))
    v.invalid("plant_image_url", "Ảnh phải là URL HTTP hoặc HTTPS.");
  for (const field of ["plant_id", "category_id"]) {
    if (input[field] !== undefined) {
      result[field] = field === "plant_id" && input[field] === null ? null : v.id(input[field], field);
    }
  }
  if (input.health_status !== undefined) {
    if (!["healthy", "treatment"].includes(input.health_status)) v.invalid("health_status");
    result.health_status = input.health_status;
  }
  if (input.acquisition_date !== undefined) {
    const value = input.acquisition_date;
    if (value === null) result.acquisition_date = null;
    else {
      if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) v.invalid("acquisition_date");
      const date = new Date(`${value}T00:00:00.000Z`);
      if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) v.invalid("acquisition_date");
      result.acquisition_date = date;
    }
  }
  if (creating && !result.plant_id) {
    result.custom_species_name = v.text(result.custom_species_name, "custom_species_name");
    result.category_id = v.id(result.category_id, "category_id");
  }
  if (!creating && !Object.keys(result).length) v.invalid("body", "Cần ít nhất một trường để cập nhật.");
  return result;
};

const query = (input = {}) => {
  v.object(input, "query");
  const result = {
    page: v.positiveInteger(input.page, 1, "page"),
    limit: v.positiveInteger(input.limit, 20, "limit", 100),
    archived: input.archived === undefined ? false : v.boolean(input.archived, "archived"),
  };
  if (!Number.isSafeInteger((result.page - 1) * result.limit)) v.invalid("page");
  if (input.search !== undefined) {
    result.search = v.text(input.search, "search", false);
    if (result.search.length > 150) v.invalid("search");
  }
  if (input.health_status !== undefined) {
    if (!["all", "healthy", "treatment"].includes(input.health_status)) v.invalid("health_status");
    result.health_status = input.health_status;
  }
  if (input.category_id !== undefined) result.category_id = v.id(input.category_id, "category_id");
  return result;
};

module.exports = { payload, query };
