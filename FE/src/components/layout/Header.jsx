import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Leaf, Menu, ShoppingCart } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PUBLIC_NAV, ROUTES } from "@/lib/constants";
import { useNotifications } from "@/features/notifications/hooks";
import { getCart } from "@/features/cart/api";
import { CART_UPDATED_EVENT, extractCartPayload, getLocalCartItemCount } from "@/features/cart/cartStorage";
import { mapBackendRoleToFeRole } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks";
import { toast } from "sonner";
import { NotificationDropdown } from "@/components/layout/header/NotificationDropdown";
import { HeaderUserMenu } from "@/components/layout/header/HeaderUserMenu";
import { getPlantCareNotificationTarget } from "@/features/notifications/notification.utils";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartItemCount, setCartItemCount] = useState(() => getLocalCartItemCount());
  const { user, logout, isAuthenticated } = useAuth();
  const normalizedRole = user ? mapBackendRoleToFeRole(user.role) : null;
  const canViewNotifications = isAuthenticated && normalizedRole === "customer";
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    error: notificationsError,
    readNotification,
    readAllNotifications,
  } = useNotifications(canViewNotifications);

  useEffect(() => {
    const updateCartItemCount = async () => {
      if (!isAuthenticated) {
        setCartItemCount(getLocalCartItemCount());
        return;
      }

      try {
        const response = await getCart();
        setCartItemCount(extractCartPayload(response).totalItems || 0);
      } catch {
        setCartItemCount(0);
      }
    };

    updateCartItemCount();
    window.addEventListener(CART_UPDATED_EVENT, updateCartItemCount);
    window.addEventListener("storage", updateCartItemCount);
    window.addEventListener("focus", updateCartItemCount);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, updateCartItemCount);
      window.removeEventListener("storage", updateCartItemCount);
      window.removeEventListener("focus", updateCartItemCount);
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    toast.success("Đăng xuất thành công!");
    navigate("/login");
  };

  const handleOpenNotification = async (notification) => {
    try {
      if (!notification.readAt) {
        await readNotification(notification._id);
      }

      const plantCareTarget = getPlantCareNotificationTarget(notification);
      if (plantCareTarget) {
        navigate(plantCareTarget);
        return;
      }

      // Thông báo đơn hàng → điều hướng đến trang Profile (xem đơn hàng)
      if (notification.type === "order_status_updated") {
        navigate(ROUTES.profile + "?tab=orders");
        return;
      }

      if (notification.postId?._id || notification.postId) {
        const postId = notification.postId?._id || notification.postId;
        navigate(ROUTES.blog, {
          state: { openPostId: postId },
        });
        return;
      }

      navigate(ROUTES.blog);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể mở thông báo");
    }
  };

  const handleReadAllNotifications = async () => {
    try {
      await readAllNotifications();
      toast.success("Đã đánh dấu tất cả là đã đọc");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể cập nhật thông báo");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link to={ROUTES.home} className="group flex items-center gap-2">
          <div
            className="
              flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br
              from-primary to-green-600 transition-transform group-hover:scale-110
            "
          >
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
            {canViewNotifications ? (
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to={ROUTES.myGarden}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      location.pathname === ROUTES.myGarden && "bg-accent"
                    )}
                  >
                    My Garden
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ) : null}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-1 sm:gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
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
                      location.pathname === item.path && "bg-accent text-primary"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                {canViewNotifications ? (
                  <Link
                    to={ROUTES.myGarden}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent",
                      location.pathname === ROUTES.myGarden
                        && "bg-accent text-primary"
                    )}
                  >
                    My Garden
                  </Link>
                ) : null}
              </nav>
            </SheetContent>
          </Sheet>

          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full"
            aria-label="Giỏ hàng"
            asChild
          >
            <Link to={ROUTES.cart}>
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span
                  className="
                    absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full
                    bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground
                  "
                >
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </Link>
          </Button>

          {isAuthenticated && user ? (
            <>
              {canViewNotifications && (
                <NotificationDropdown
                  error={notificationsError}
                  loading={notificationsLoading}
                  notifications={notifications}
                  onOpenNotification={handleOpenNotification}
                  onReadAll={handleReadAllNotifications}
                  unreadCount={unreadCount}
                />
              )}

              <HeaderUserMenu
                canViewNotifications={canViewNotifications}
                normalizedRole={normalizedRole}
                onLogout={handleLogout}
                user={user}
              />
            </>
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
