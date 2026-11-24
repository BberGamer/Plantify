export const invalidTreatmentResponse = () =>
  Object.assign(new Error("Dữ liệu điều trị không hợp lệ."), {
    code: "INVALID_RESPONSE",
  });

export const isTreatmentSchedule = (value) =>
  Boolean(
    value &&
    typeof value === "object" &&
    typeof value._id === "string" &&
    typeof value.status === "string" &&
    value.protocol &&
    typeof value.protocol.standard_duration_days === "number" &&
    value.plant &&
    value.disease &&
    Array.isArray(value.stages) &&
    Array.isArray(value.task_progress),
  );
