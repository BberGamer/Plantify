const v = require("../validators/common");
const DAY = 86400000;
const isTime = (value) =>
  typeof value === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
const localDateTime = (now = Date.now()) =>
  new Date(now + 7 * 3600000).toISOString();
const shiftDate = (day, days) =>
  new Date(Date.parse(day) + days * DAY).toISOString().slice(0, 10);
function date(value, field = "date") {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString().slice(0, 10) !== value
  )
    v.invalid(field, "Ngày phải hợp lệ và có dạng YYYY-MM-DD.");
  return value;
}
function occurs(schedule, day) {
  if (
    !schedule.start_date ||
    day < schedule.start_date ||
    (schedule.end_date && day > schedule.end_date)
  )
    return false;
  return (
    ((Date.parse(day) - Date.parse(schedule.start_date)) / DAY) %
      schedule.repeat_every_days ===
    0
  );
}
function dates(from, to) {
  date(from, "from");
  date(to, "to");
  const count = (Date.parse(to) - Date.parse(from)) / DAY;
  if (count < 0 || count > 61)
    v.invalid("to", "Chỉ xem tối đa 62 ngày mỗi lần.");
  return Array.from({ length: count + 1 }, (_, i) =>
    shiftDate(from, i),
  );
}
module.exports = { date, occurs, dates, isTime, localDateTime, shiftDate };
