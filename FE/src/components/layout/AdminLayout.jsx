// AdminLayout.jsx
// Layout quản trị Plantify: sidebar trái, drawer mobile và tùy chọn tài khoản ở cuối sidebar.

import { Link, Navigate, Outlet, useLocation } from "react-router";
import {
  Bell,
  LayoutDashboard,
  Leaf,
  Loader2,
  LogOut,
  Menu,
  Users
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

const adminMenuItems = [
  {
    label: "Tổng quan",
    path: "/admin",
    icon: LayoutDashboard
  },
  {
    label: "Người dùng",
    path: "/admin/users",
    icon: Users
  }
];

function AdminLayout({ children }) {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const location = useLocation();

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

  if (user.role !== "admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border bg-card lg:block">
        <AdminSidebar pathname={location.pathname} onLogout={logout} />
      </aside>

      <MobileSidebar pathname={location.pathname} onLogout={logout} />

      <div className="min-h-screen lg:pl-72">
        <main className="mx-auto w-full max-w-7xl px-4 py-6 pt-20 sm:px-6 lg:px-8 lg:pt-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

function MobileSidebar({ pathname, onLogout }) {
  return (
    <div className="fixed left-4 top-4 z-50 lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="bg-background shadow-sm">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Mở menu quản trị</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu quản trị</SheetTitle>
          </SheetHeader>
          <AdminSidebar pathname={pathname} onLogout={onLogout} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function AdminSidebar({ pathname, onLogout }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-4">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-none">Plantify</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">Admin Console</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {adminMenuItems.map((item) => (
          <AdminSidebarLink
            key={item.path}
            item={item}
            isActive={pathname === item.path}
          />
        ))}
      </nav>

      <SidebarAccountOptions onLogout={onLogout} />
    </div>
  );
}

function SidebarAccountOptions({ onLogout }) {
  return (
    <div className="space-y-1 border-t border-border p-3">
      <Button variant="ghost" className="w-full justify-start gap-3 px-3" type="button">
        <Bell className="h-4 w-4" />
        <span>Thông báo</span>
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 px-3 text-destructive hover:text-destructive"
        onClick={onLogout}
      >
        <LogOut className="h-4 w-4" />
        <span>Đăng xuất</span>
      </Button>
    </div>
  );
}

function AdminSidebarLink({ item, isActive }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      className={cn(
        "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{item.label}</span>
    </Link>
  );
}

export default AdminLayout;
