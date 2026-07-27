// ManagerSidebars.jsx - Hiển thị thanh điều hướng desktop và mobile cho khu vực quản lý
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Leaf, LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

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
  onLogout,
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
          <ManagerLayoutLink
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

function ManagerLayoutLink({ item, isActive, isCollapsed = false }) {
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

export { ManagerSidebar, MobileSidebar };
