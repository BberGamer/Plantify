export const ROLE_ROUTES = {
  admin: "/admin/users",
  manager: "/manager/plants",
  customer: "/(tabs)",
};

export function getAuthRedirect(
  { hasHydrated, isRestoring, isAuthenticated, role },
  group,
) {
  if (!hasHydrated || isRestoring) return null;
  if (!isAuthenticated) return group === "(auth)" ? null : "/(auth)/login";
  if (
    !group ||
    group === "(auth)" ||
    (group === "admin" && role !== "admin") ||
    (group === "manager" && role !== "manager") ||
    (group === "(tabs)" && role !== "customer")
  ) {
    return ROLE_ROUTES[role] || ROLE_ROUTES.customer;
  }
  return null;
}
