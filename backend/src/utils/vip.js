const DAY = 86400000;
const PLANS = Object.freeze([
  { code: "VIP1", name: "VIP 1 tháng", price: 50000, days: 30 },
  { code: "VIP3", name: "VIP 3 tháng", price: 120000, days: 90 },
  { code: "VIP12", name: "VIP 1 năm", price: 499000, days: 365 },
]);
const isVip = (user, now = new Date()) => Boolean(user?.isproaccount &&
  new Date(user.vip_expires_at).getTime() > now.getTime());
// Mốc hết hạn là 00:00 ngày kế tiếp tại UTC+7, so sánh bằng dấu <.
function vipExpiry(current, days, now = new Date()) {
  if (current && new Date(current) > now) return new Date(new Date(current).getTime() + days * DAY);
  const vietnam = new Date(now.getTime() + 7 * 3600000);
  return new Date(Date.UTC(vietnam.getUTCFullYear(), vietnam.getUTCMonth(), vietnam.getUTCDate()) + days * DAY - 7 * 3600000);
}
module.exports = { PLANS, isVip, vipExpiry };
