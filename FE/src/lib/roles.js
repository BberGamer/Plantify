// roles.js
// Vai tro nguoi dung va ham so sanh quyen.
export const USER_ROLES = [
  "guest",
  "customer",
  "manager",
  "admin"
];

export const ROLE_LABELS = {
  guest: "Khach",
  customer: "Khach hang",
  manager: "Quan ly",
  admin: "Quan tri vien"
};

export const ROLE_RANK = {
  guest: 0,
  customer: 1,
  manager: 2,
  admin: 3
};

export function hasMinimumRole(userRole, requiredRole) {
  return ROLE_RANK[userRole] >= ROLE_RANK[requiredRole];
}
