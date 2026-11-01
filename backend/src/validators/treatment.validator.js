const v = require("./common");

const generate = (input) => {
  v.object(input);
  for (const key of Object.keys(input)) {
    if (!["user_plant_id", "disease_id", "treatment_protocol_id", "diagnosis_id", "start_date"].includes(key))
      v.invalid(key, `Trường ${key} không được hỗ trợ.`);
  }
  const result = {
    user_plant_id: v.id(input.user_plant_id, "user_plant_id"),
    disease_id: v.id(input.disease_id, "disease_id"),
    treatment_protocol_id: v.id(input.treatment_protocol_id, "treatment_protocol_id"),
  };
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

module.exports = { generate, finish, rescheduleTask };
