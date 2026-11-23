// Ngày nhận cây dùng cùng múi giờ nghiệp vụ với backend, không phụ thuộc thiết bị.
export const todayGardenDate = () => new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date());

export function validateGardenDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000-") ||
      !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value)
    return "Ngày nhận cây không hợp lệ.";
  if (value > todayGardenDate()) return "Ngày nhận cây không được ở tương lai.";
  return "";
}

export const formatGardenDate = (value) => value ? value.split("-").reverse().join("/") : "Chọn ngày nhận cây";
