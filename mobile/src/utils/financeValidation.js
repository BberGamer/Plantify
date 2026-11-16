export function amountError(value) {
  const text = String(value).trim();
  if (!text) return "Vui lòng nhập số tiền.";
  if (!/^\d+$/.test(text)) return "Chỉ nhập chữ số cho số tiền, không dùng dấu chấm, dấu phẩy hoặc số thập phân.";
  const amount = Number(text);
  return Number.isSafeInteger(amount) && amount >= 10000 && amount <= 10000000
    ? "" : "Số tiền phải từ 10.000 đến 10.000.000 đồng.";
}

export function reasonError(value) {
  return typeof value === "string" && value.trim().length >= 5 && value.length <= 500 &&
    !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)
    ? "" : "Lý do phải có từ 5 đến 500 ký tự và không chứa ký tự không hợp lệ.";
}
