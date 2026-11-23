const v = require("./common");

const allowedProtocolFields = [
  "disease_id",
  "plant_ids",
  "protocol_name",
  "description",
  "duration_days",
  "stages",
  "approved_instructions",
  "safety_guidelines",
  "status",
];

const textList = (value, field, required = true) => {
  if (!Array.isArray(value) || (required && value.length === 0))
    v.invalid(field, `Trường ${field} phải là danh sách không rỗng.`);
  const items = value.map((item, index) => {
    const result = v.text(item, `${field}.${index}`);
    if (result.length > 2000)
      v.invalid(field, `Mỗi nội dung trong ${field} tối đa 2000 ký tự.`);
    return result;
  });
  return [...new Set(items)];
};

const protocol = (input) => {
  v.object(input);
  for (const key of Object.keys(input)) {
    if (!allowedProtocolFields.includes(key))
      v.invalid(key, `Trường ${key} không được hỗ trợ.`);
  }
  if (!Array.isArray(input.plant_ids) || input.plant_ids.length === 0)
    v.invalid("plant_ids", "Vui lòng chọn ít nhất một cây áp dụng.");
  if (input.duration_days === undefined)
    v.invalid("duration_days", "Vui lòng nhập thời lượng phác đồ.");
  const duration = v.positiveInteger(
    input.duration_days,
    undefined,
    "duration_days",
    365,
  );
  if (!Array.isArray(input.stages) || input.stages.length === 0)
    v.invalid("stages", "Phác đồ cần ít nhất một giai đoạn.");
  const stages = input.stages.map((stage, index) => {
    v.object(stage, `stages.${index}`);
    for (const key of Object.keys(stage)) {
      if (
        ![
          "order",
          "title",
          "time",
          "start_day",
          "end_day",
          "instructions",
          "dosage_note",
          "important_note",
        ].includes(key)
      )
        v.invalid(`stages.${index}.${key}`);
    }
    const title = v.text(stage.title, `stages.${index}.title`);
    const startDay = v.positiveInteger(
      stage.start_day,
      undefined,
      `stages.${index}.start_day`,
      duration,
    );
    const endDay = v.positiveInteger(
      stage.end_day,
      undefined,
      `stages.${index}.end_day`,
      duration,
    );
    if (endDay < startDay)
      v.invalid(`stages.${index}.end_day`, "Ngày kết thúc phải từ ngày bắt đầu trở đi.");
    return {
      order: index + 1,
      title,
      time: (() => {
        const value = stage.time || "08:00";
        if (typeof value !== "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value))
          v.invalid(`stages.${index}.time`, "Giờ thực hiện phải có định dạng HH:mm.");
        return value;
      })(),
      start_day: startDay,
      end_day: endDay,
      instructions: textList(stage.instructions, `stages.${index}.instructions`),
      dosage_note: v.text(stage.dosage_note || "", `stages.${index}.dosage_note`, false),
      important_note: v.text(
        stage.important_note || "",
        `stages.${index}.important_note`,
        false,
      ),
    };
  });
  const status = input.status || "draft";
  if (!["draft", "approved"].includes(status))
    v.invalid("status", "Trạng thái phác đồ không hợp lệ.");
  const result = {
    disease_id: v.id(input.disease_id, "disease_id"),
    plant_ids: [...new Set(input.plant_ids.map((id) => v.id(id, "plant_ids")))],
    protocol_name: v.text(input.protocol_name, "protocol_name"),
    description: v.text(input.description, "description"),
    duration_days: duration,
    stages,
    approved_instructions: textList(
      input.approved_instructions || [],
      "approved_instructions",
      status === "approved",
    ),
    safety_guidelines: textList(input.safety_guidelines, "safety_guidelines"),
    status,
  };
  if (result.protocol_name.length > 200) v.invalid("protocol_name");
  if (result.description.length > 5000) v.invalid("description");
  return result;
};

const aiDraft = (input) => {
  v.object(input);
  for (const key of Object.keys(input))
    if (!["disease_id", "plant_ids", "reference_material"].includes(key))
      v.invalid(key, `Trường ${key} không được hỗ trợ.`);
  if (!Array.isArray(input.plant_ids) || !input.plant_ids.length)
    v.invalid("plant_ids", "Vui lòng chọn ít nhất một cây áp dụng.");
  const referenceMaterial = v.text(input.reference_material, "reference_material");
  if (referenceMaterial.length < 50 || referenceMaterial.length > 12000)
    v.invalid("reference_material", "Dữ liệu tham chiếu phải có từ 50 đến 12000 ký tự.");
  return {
    disease_id: v.id(input.disease_id, "disease_id"),
    plant_ids: [...new Set(input.plant_ids.map((id) => v.id(id, "plant_ids")))],
    reference_material: referenceMaterial,
  };
};

const generate = (input) => {
  v.object(input);
  for (const key of Object.keys(input)) {
    if (!["user_plant_id", "disease_id", "preview_token", "diagnosis_id", "start_date"].includes(key))
      v.invalid(key, `Trường ${key} không được hỗ trợ.`);
  }
  const result = {
    user_plant_id: v.id(input.user_plant_id, "user_plant_id"),
    disease_id: v.id(input.disease_id, "disease_id"),
    preview_token: v.text(input.preview_token, "preview_token"),
  };
  if (result.preview_token.length > 50000) v.invalid("preview_token", "Bản xem trước phác đồ quá lớn.");
  if (input.diagnosis_id !== undefined && input.diagnosis_id !== null)
    result.diagnosis_id = v.id(input.diagnosis_id, "diagnosis_id");
  if (input.start_date !== undefined) {
    if (typeof input.start_date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input.start_date))
      v.invalid("start_date", "Ngày bắt đầu phải có định dạng YYYY-MM-DD.");
    const date = new Date(`${input.start_date}T00:00:00.000Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== input.start_date)
      v.invalid("start_date", "Ngày bắt đầu không hợp lệ.");
    result.start_date = date;
  }
  return result;
};

const finish = (input) => {
  v.object(input);
  for (const key of Object.keys(input)) {
    if (!["status", "note"].includes(key)) v.invalid(key, `Trường ${key} không được hỗ trợ.`);
  }
  if (!["recovered", "failed", "cancelled"].includes(input.status))
    v.invalid("status", "Trạng thái kết thúc không hợp lệ.");
  const result = { status: input.status };
  if (input.note !== undefined) {
    result.note = v.text(input.note, "note", false);
    if (result.note.length > 5000) v.invalid("note", "Ghi chú tối đa 5000 ký tự.");
  } else result.note = "";
  return result;
};

const rescheduleTask = (input) => {
  v.object(input);
  for (const key of Object.keys(input)) {
    if (key !== "scheduled_date")
      v.invalid(key, `Trường ${key} không được hỗ trợ.`);
  }
  if (
    typeof input.scheduled_date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(input.scheduled_date)
  )
    v.invalid("scheduled_date", "Ngày thực hiện phải có định dạng YYYY-MM-DD.");
  const scheduledDate = new Date(`${input.scheduled_date}T00:00:00.000Z`);
  if (
    !Number.isFinite(scheduledDate.getTime()) ||
    scheduledDate.toISOString().slice(0, 10) !== input.scheduled_date
  )
    v.invalid("scheduled_date", "Ngày thực hiện không hợp lệ.");
  return { scheduled_date: scheduledDate };
};

const editTask = (input) => {
  v.object(input);
  const allowed = [
    "title",
    "scheduled_date",
    "time",
    "instructions",
    "dosage_note",
    "important_note",
  ];
  for (const key of Object.keys(input)) {
    if (!allowed.includes(key))
      v.invalid(key, `Trường ${key} không được hỗ trợ.`);
  }
  if (!Object.keys(input).length)
    v.invalid("task", "Vui lòng nhập ít nhất một nội dung cần cập nhật.");

  const result = {};
  if (input.title !== undefined) {
    result.title = v.text(input.title, "title");
    if (result.title.length > 200)
      v.invalid("title", "Tiêu đề tối đa 200 ký tự.");
  }
  if (input.scheduled_date !== undefined)
    result.scheduled_date = rescheduleTask({
      scheduled_date: input.scheduled_date,
    }).scheduled_date;
  if (input.time !== undefined) {
    if (
      typeof input.time !== "string" ||
      !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(input.time)
    )
      v.invalid("time", "Giờ thực hiện phải có định dạng HH:mm.");
    result.time = input.time;
  }
  if (input.instructions !== undefined) {
    const instruction = v.text(input.instructions, "instructions");
    if (instruction.length > 2000)
      v.invalid("instructions", "Hướng dẫn tối đa 2000 ký tự.");
    result.instructions = [instruction];
  }
  for (const field of ["dosage_note", "important_note"]) {
    if (input[field] === undefined) continue;
    result[field] = v.text(input[field], field, false);
    if (result[field].length > 2000)
      v.invalid(field, "Nội dung tối đa 2000 ký tự.");
  }
  return result;
};

module.exports = { generate, finish, rescheduleTask, editTask, protocol, aiDraft };
