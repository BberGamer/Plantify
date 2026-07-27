// ManagerLayout.jsx - Bố trí thanh bên, nội dung và tài khoản cho khu vực quản lý

import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { LayoutDashboard, BookOpen, Leaf, Menu, ShoppingBag, FolderOpen, Flag, Package, Tags, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/features/auth/hooks";
import { cn } from "@/lib/utils";
import {
  ManagerSidebar,
  MobileSidebar,
} from "@/components/layout/manager-layout/ManagerSidebars";

const managerMenuConfig = {
  "business manager": [
    {
      label: "Dashboard",
      path: "/business",
      icon: LayoutDashboard
    },
    {
      label: "Quản lý đơn hàng",
      path: "/business/orders",
      icon: ShoppingBag
    },
    {
      label: "Quản lý sản phẩm",
      path: "/business/products",
      icon: Package
    },
    {
      label: "Loại sản phẩm",
      path: "/business/categories",
      icon: Tags
    }
  ],
  "content manager": [
    {
      label: "Quản lý Cây",
      path: "/content/plants",
      icon: Leaf
    },
    {
      label: "Hướng dẫn chăm sóc",
      path: "/content/care-guides",
      icon: BookOpen
    },
    {
      label: "Bệnh cây",
      path: "/content/diseases",
      icon: AlertCircle
    },
    {
      label: "Quản lý Danh mục",
      path: "/content/categories",
      icon: FolderOpen
    },
    {
      label: "Xử lý report",
      path: "/content/reports",
      icon: Flag
    }
  ]
};

const managerRoleLabels = {
  "business manager": "Business Manager",
  "content manager": "Content Manager"
};

const getManagerRole = (role) => {
  const normalizedRole = role?.toLowerCase();

  if (normalizedRole === "content manager") {
    return "content manager";
  }

  if (normalizedRole === "business manager") {
    return "business manager";
  }

  return null;
};

function ManagerLayoutInner({ children, menuItems, roleLabel }) {
  const { logout } = useAuth();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-border bg-card transition-[width] duration-200 lg:block",
          isSidebarCollapsed ? "w-16" : "w-60"
        )}
      >
        <ManagerSidebar
          pathname={location.pathname}
          roleLabel={roleLabel}
          menuItems={menuItems}
          isCollapsed={isSidebarCollapsed}
          onLogout={logout}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="
            absolute -right-12 top-3 h-10 w-10 rounded-full border border-border bg-background
            text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground
          "
          onClick={() => setIsSidebarCollapsed((current) => !current)}
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">
            {isSidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          </span>
        </Button>
      </aside>

      <MobileSidebar
        pathname={location.pathname}
        roleLabel={roleLabel}
        menuItems={menuItems}
        onLogout={logout}
      />

      <div
        className={cn(
          "min-h-screen transition-[padding] duration-200",
          isSidebarCollapsed ? "lg:pl-16" : "lg:pl-60"
        )}
      >
        <main className="mx-auto w-full max-w-7xl px-4 py-6 pt-20 sm:px-6 lg:px-8 lg:pl-[10px] lg:pt-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

function ManagerLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={["business_manager", "content_manager"]}>
      <ManagerLayoutRouter>{children}</ManagerLayoutRouter>
    </ProtectedRoute>
  );
}

function ManagerLayoutRouter({ children }) {
  const { user } = useAuth();
  const managerRole = getManagerRole(user?.role);
  const menuItems = managerMenuConfig[managerRole] || [];
  const roleLabel = managerRoleLabels[managerRole];

  return (
    <ManagerLayoutInner menuItems={menuItems} roleLabel={roleLabel}>
      {children}
    </ManagerLayoutInner>
  );
}

function BusinessManagerLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={["business_manager"]}>
      <ManagerLayoutInner
        menuItems={managerMenuConfig["business manager"]}
        roleLabel={managerRoleLabels["business manager"]}
      >
        {children}
      </ManagerLayoutInner>
    </ProtectedRoute>
  );
}

function ContentManagerLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={["content_manager"]}>
      <ManagerLayoutInner
        menuItems={managerMenuConfig["content manager"]}
        roleLabel={managerRoleLabels["content manager"]}
      >
        {children}
      </ManagerLayoutInner>
    </ProtectedRoute>
  );
}

export default ManagerLayout;
export { BusinessManagerLayout, ContentManagerLayout };
