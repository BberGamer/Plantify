// ManagerLayout.jsx
// Layout quản lý Plantify: sidebar trái, drawer mobile và tùy chọn tài khoản ở cuối sidebar.

import { useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router";
import {
  LayoutDashboard,
  BookOpen,
  Leaf,
  Loader2,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  FolderOpen,
  Flag,
  Package,
  Tags
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { useAuth } from "@/features/auth/hooks";
import { cn } from "@/lib/utils";

const managerMenuConfig = {
  "business manager": [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard
    },
    {
      label: "Quản lý đơn hàng",
      path: "/dashboard/team",
      icon: ShoppingBag
    },
    {
      label: "Quản lý sản phẩm",
      path: "/dashboard/products",
      icon: Package
    },
    {
      label: "Loại sản phẩm",
      path: "/dashboard/categories",
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
  "content manager": "Quản lý nội dung"
};

const getManagerRole = (role) => {
  const normalizedRole = role?.toLowerCase();

  if (normalizedRole === "content manager") {
    return "content manager";
  }

  return "business manager";
};

function ManagerLayout({ children }) {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const managerRole = getManagerRole(user?.role);
  const menuItems = managerMenuConfig[managerRole];
  const roleLabel = managerRoleLabels[managerRole];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!managerMenuConfig[user.role]) {
    return <Navigate to="/unauthorized" replace />;
  }

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
          className="absolute -right-12 top-3 h-10 w-10 rounded-full border border-border bg-background text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground"
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

function MobileSidebar({ pathname, roleLabel, menuItems, onLogout }) {
  return (
    <div className="fixed left-4 top-4 z-50 lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="bg-background shadow-sm">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Mở menu quản lý</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu quản lý</SheetTitle>
          </SheetHeader>
          <ManagerSidebar
            pathname={pathname}
            roleLabel={roleLabel}
            menuItems={menuItems}
            onLogout={onLogout}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ManagerSidebar({
  pathname,
  roleLabel,
  menuItems,
  isCollapsed = false,
  onLogout
}) {
  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-16 items-center border-b border-border",
          isCollapsed ? "justify-center px-3" : "px-4"
        )}
      >
        <Link
          to={menuItems[0].path}
          className={cn("flex items-center gap-3", isCollapsed && "justify-center")}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </div>
          <div className={cn("min-w-0", isCollapsed && "hidden")}>
            <p className="truncate text-sm font-bold leading-none">Plantify</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">{roleLabel}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => (
          <ManagerSidebarLink
            key={item.path}
            item={item}
            isActive={pathname === item.path}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>

      <SidebarAccountOptions isCollapsed={isCollapsed} onLogout={onLogout} />
    </div>
  );
}

function SidebarAccountOptions({ isCollapsed = false, onLogout }) {
  return (
    <div className="space-y-1 border-t border-border p-3">
      <Button
        variant="ghost"
        className={cn(
          "w-full gap-3",
          isCollapsed ? "justify-center px-0" : "justify-start px-3"
        )}
        asChild
      >
        <Link to="/settings">
          <Settings className="h-4 w-4" />
          <span className={cn(isCollapsed && "sr-only")}>Cài đặt</span>
        </Link>
      </Button>
      <Button
        variant="ghost"
        className={cn(
          "w-full gap-3 text-destructive hover:text-destructive",
          isCollapsed ? "justify-center px-0" : "justify-start px-3"
        )}
        onClick={onLogout}
      >
        <LogOut className="h-4 w-4" />
        <span className={cn(isCollapsed && "sr-only")}>Đăng xuất</span>
      </Button>
    </div>
  );
}

function ManagerSidebarLink({ item, isActive, isCollapsed = false }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      className={cn(
        "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        isCollapsed && "justify-center px-0",
        isActive && "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
      )}
      title={isCollapsed ? item.label : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className={cn(isCollapsed && "sr-only")}>{item.label}</span>
    </Link>
  );
}

export default ManagerLayout;
