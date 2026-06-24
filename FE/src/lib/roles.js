// roles.js
// Vai tro nguoi dung va ham so sanh quyen.
export const USER_ROLES = [
  "guest",
  "customer",
  "business_manager",
  "content_manager",
  "admin"
];

export const ROLE_LABELS = {
  guest: "Khach",
  customer: "Khach hang",
  business_manager: "Quan ly kinh doanh",
  content_manager: "Quan ly noi dung",
  admin: "Quan tri vien"
};

export const ROLE_RANK = {
  guest: 0,
  customer: 1,
  business_manager: 2,
  content_manager: 3,
  admin: 4
};

export function hasMinimumRole(userRole, requiredRole) {
  return ROLE_RANK[userRole] >= ROLE_RANK[requiredRole];
}
