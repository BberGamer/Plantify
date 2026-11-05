export const ROLE_ROUTES = {
  admin: "/admin/users",
  manager: "/manager/plants",
  customer: "/customer",
};

export function getAuthRedirect(
  { hasHydrated, isRestoring, isAuthenticated, role },
  group,
) {
  if (!hasHydrated || isRestoring) return null;
  if (!isAuthenticated) return group === "auth" ? null : "/auth/login";
  if (
    !group ||
    group === "index" ||
    group === "auth" ||
    (group === "admin" && role !== "admin") ||
    (group === "manager" && role !== "manager") ||
    (group === "customer" && role !== "customer")
  ) {
    return ROLE_ROUTES[role] || ROLE_ROUTES.customer;
  }
  return null;
}
