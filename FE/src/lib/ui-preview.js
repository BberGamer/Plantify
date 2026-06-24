const UI_PREVIEW_USER = {
  name: "Người dùng",
  role: "customer",
  avatarUrl: void 0
};
function uiSidebarRoleFromPath(pathname) {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/business")) return "business_manager";
  if (pathname.startsWith("/content")) return "content_manager";
  return "customer";
}
export {
  UI_PREVIEW_USER,
  uiSidebarRoleFromPath
};
