// ManagerLayout.jsx
// Layout quản lý Plantify: dùng chung phong cách với AdminLayout, đổi menu theo vai trò manager.

import { Link, Outlet, useLocation } from "react-router";
import {
  Bell,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  Search,
  Settings,
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
import { Input } from "@/components/ui/input";
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
    }
  ],
  "content manager": [
    {
      label: "Dashboard",
      path: "/my-shop",
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
  const { user, logout } = useAuth();
  const location = useLocation();
  const managerRole = getManagerRole(user?.role);
  const menuItems = managerMenuConfig[managerRole];
  const roleLabel = managerRoleLabels[managerRole];

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border bg-card lg:block">
        <ManagerSidebar
          pathname={location.pathname}
          roleLabel={roleLabel}
          menuItems={menuItems}
        />
      </aside>

      <div className="min-h-screen lg:pl-72">
        <ManagerHeader
          user={user}
          onLogout={logout}
          pathname={location.pathname}
          roleLabel={roleLabel}
          menuItems={menuItems}
        />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

function ManagerHeader({ user, onLogout, pathname, roleLabel, menuItems }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
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
            />
          </SheetContent>
        </Sheet>

        <div className="relative hidden flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm trong quản lý..."
            className="h-10 max-w-md bg-background pl-9"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="sm:hidden">
            <Search className="h-5 w-5" />
            <span className="sr-only">Tìm kiếm</span>
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            <span className="sr-only">Thông báo</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl || user?.avatar} alt={user?.fullName || "Manager"} />
                  <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-32 truncate text-sm font-medium md:inline">
                  {user?.fullName || user?.name || "Manager"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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
      </div>
    </header>
  );
}

function ManagerSidebar({ pathname, roleLabel, menuItems }) {
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
