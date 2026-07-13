// roleMapping.js - Mapping giữa role và dashboard/allowed roles

export const ROLE_DASHBOARD = {
  customer: "/",
  business_manager: "/business",
  content_manager: "/content/plants",
  admin: "/admin",
};

export const ROUTE_ALLOWED_ROLES = {
  "/": ["customer"],
  "/business": ["business_manager"],
  "/content/plants": ["content_manager"],
  "/admin": ["admin"],
};

const normalizeRole = (role) =>
  role?.toLowerCase().replace(/_/g, " ");

export const getDashboardPath = (role) => {
  if (!role) return "/";
  if (role === "/unauthorized" || role === "/login") return "/";
  if (role.startsWith("/")) return role;
  return ROLE_DASHBOARD[normalizeRole(role).replace(/ /g, "_")] || "/";
};

export const isRoleAllowed = (userRole, allowedRoles) => {
  if (!userRole) return false;
  const normalized = userRole.replace(/_/g, " ").toLowerCase();
  return allowedRoles.some((role) => role.toLowerCase().replace(/_/g, " ") === normalized);
};
