const UI_PREVIEW_USER = {
  name: "Người dùng",
  role: "customer",
  avatarUrl: void 0
};
function uiSidebarRoleFromPath(pathname) {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/dashboard")) return "manager";
  if (pathname.startsWith("/content")) return "manager";
  return "customer";
}
export {
  UI_PREVIEW_USER,
  uiSidebarRoleFromPath
};
