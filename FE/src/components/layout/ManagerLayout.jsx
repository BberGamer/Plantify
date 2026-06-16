// ManagerLayout.jsx
// Layout quản lý Plantify: sidebar trái, drawer mobile và tùy chọn tài khoản ở cuối sidebar.

import { Link, Navigate, Outlet, useLocation } from "react-router";
import {
  Bell,
  LayoutDashboard,
  Leaf,
  Loader2,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  User
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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
    }
  ],
  "content manager": [
    {
      label: "Dashboard",
      path: "/content/dashboard",
      icon: LayoutDashboard
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

  return "business manager";
};

const getUserInitials = (user) => {
  const displayName = user?.fullName || user?.name || user?.email || "Manager";

  return displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

function ManagerLayout({ children }) {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const location = useLocation();
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
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border bg-card lg:block">
        <ManagerSidebar
          pathname={location.pathname}
          roleLabel={roleLabel}
          menuItems={menuItems}
          user={user}
          onLogout={logout}
        />
      </aside>

      <MobileSidebar
        pathname={location.pathname}
        roleLabel={roleLabel}
        menuItems={menuItems}
        user={user}
        onLogout={logout}
      />

      <div className="min-h-screen lg:pl-72">
        <main className="mx-auto w-full max-w-7xl px-4 py-6 pt-20 sm:px-6 lg:px-8 lg:pt-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

function MobileSidebar({ pathname, roleLabel, menuItems, user, onLogout }) {
  return (
    <div className="fixed left-4 top-4 z-50 lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="bg-background shadow-sm">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Mở menu quản lý</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu quản lý</SheetTitle>
          </SheetHeader>
          <ManagerSidebar
            pathname={pathname}
            roleLabel={roleLabel}
            menuItems={menuItems}
            user={user}
            onLogout={onLogout}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ManagerSidebar({ pathname, roleLabel, menuItems, user, onLogout }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-4">
        <Link to={menuItems[0].path} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </div>
          <div className="min-w-0">
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
          />
        ))}
      </nav>

      <SidebarAccountOptions user={user} onLogout={onLogout} />
    </div>
  );
}

function SidebarAccountOptions({ user, onLogout }) {
  return (
    <div className="space-y-2 border-t border-border p-3">
      <Button variant="ghost" className="relative w-full justify-start px-3">
        <Bell className="h-4 w-4" />
        <span>Thông báo</span>
        <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-auto w-full justify-start gap-3 px-3 py-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.avatarUrl || user?.avatar} alt={user?.fullName || "Manager"} />
              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                {getUserInitials(user)}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-sm font-medium">
                {user?.fullName || user?.name || "Manager"}
              </span>
              <span className="block truncate text-xs font-normal text-muted-foreground">
                {user?.email || "manager@plantify.local"}
              </span>
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>{user?.fullName || user?.name || "Manager"}</span>
              <span className="truncate text-xs font-normal text-muted-foreground">
                {user?.email || "manager@plantify.local"}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile">
              <User className="h-4 w-4" />
              Hồ sơ
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings">
              <Settings className="h-4 w-4" />
              Cài đặt
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout}>
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ManagerSidebarLink({ item, isActive }) {
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

export default ManagerLayout;
