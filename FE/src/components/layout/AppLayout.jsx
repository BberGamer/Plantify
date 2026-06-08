import { Outlet, useLocation, Navigate } from "react-router";
import {
  SidebarProvider,
  SidebarInset
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ROLE_SIDEBAR_NAV } from "@/lib/constants";
import { useAuth } from "@/features/auth/hooks";
import { hasMinimumRole } from "@/lib/roles";
import { Loader2 } from "lucide-react";

// Ánh xạ vai trò từ DB sang FE role
const mapDbRoleToFeRole = (dbRole) => {
  if (dbRole === "business manager") return "manager";
  if (dbRole === "content manager") return "sales";
  return dbRole || "customer";
};

function AppLayout() {
  const { pathname } = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const sidebarRole = mapDbRoleToFeRole(user.role);

  // Kiểm tra quyền truy cập (Route Guarding)
  let requiredRole = "customer";
  if (pathname.startsWith("/admin")) {
    requiredRole = "admin";
  } else if (pathname.startsWith("/dashboard")) {
    requiredRole = "manager";
  } else if (pathname.startsWith("/my-shop")) {
    requiredRole = "sales";
  }

  if (!hasMinimumRole(sidebarRole, requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  const sidebarItems = ROLE_SIDEBAR_NAV[sidebarRole] ?? ROLE_SIDEBAR_NAV.customer;

  return (
    <SidebarProvider>
      <AppSidebar role={sidebarRole} items={sidebarItems} />
      <SidebarInset className="min-h-screen bg-background">
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export { AppLayout };
