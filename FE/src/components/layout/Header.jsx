import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Leaf,
  Menu,
  User,
  Settings,
  LogOut,
  Store,
  ShoppingCart
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PUBLIC_NAV } from "@/lib/constants";
import { ROUTES } from "@/lib/constants";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks";
import { toast } from "sonner";
import { useNavigate } from "react-router";

function Header() {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Đăng xuất thành công!");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link to={ROUTES.home} className="group flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-green-600 transition-transform group-hover:scale-110">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="hidden text-xl font-bold sm:inline">Plantify</span>
        </Link>

        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {PUBLIC_NAV.map((item) => (
              <NavigationMenuItem key={item.path}>
                <NavigationMenuLink asChild>
                  <Link
                    to={item.path}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      location.pathname === item.path && "bg-accent"
                    )}
                  >
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <nav className="mt-8 flex flex-col gap-2">
                {PUBLIC_NAV.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent",
                      location.pathname === item.path &&
                        "bg-accent text-primary"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
            asChild
          >
            <Link to={ROUTES.aiDoctor}>Hỏi AI</Link>
          </Button>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-green-600 text-primary-foreground">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user.fullName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.profile} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Hồ sơ
                  </Link>
                </DropdownMenuItem>
                {(user.role === "admin" || user.role === "manager" || user.role === "business manager" || user.role === "sales" || user.role === "content manager") && (
                  <DropdownMenuItem asChild>
                    <Link
                      to={
                        user.role === "admin"
                          ? ROUTES.admin
                          : (user.role === "manager" || user.role === "business manager")
                          ? ROUTES.dashboard
                          : ROUTES.myShop
                      }
                      className="cursor-pointer"
                    >
                      <Store className="mr-2 h-4 w-4" />
                      Trang quản lý
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.cart} className="cursor-pointer">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Giỏ hàng
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.settings} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Cài đặt
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to={ROUTES.login}>Đăng nhập</Link>
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-primary to-green-600" asChild>
                <Link to={ROUTES.register}>Đăng ký</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export { Header };
