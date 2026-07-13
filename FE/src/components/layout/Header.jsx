import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Leaf,
  Loader2,
  Menu,
  User,
  LogOut,
  MapPin,
  Store,
  ShoppingCart,
  PenSquare,
  Package,
  MessageCircle,
  AlertTriangle,
  CheckCheck,
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
import { PUBLIC_NAV, ROUTES } from "@/lib/constants";
import { useNotifications } from "@/features/notifications/hooks";
import { getCart } from "@/features/cart/api";
import { CART_UPDATED_EVENT, extractCartPayload, getLocalCartItemCount } from "@/features/cart/cartStorage";
import { mapBackendRoleToFeRole } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks";
import { toast } from "sonner";

function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

function getNotificationIcon(type) {
  switch (type) {
    case "order_status_updated":
      return <Package className="h-4 w-4 text-blue-500" />;
    case "post_commented":
      return <MessageCircle className="h-4 w-4 text-green-500" />;
    case "post_reported_under_review":
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
}

function formatNotificationMessage(notification) {
  if (notification.type === "order_status_updated") {
    return notification.message || "Đơn hàng của bạn đã được cập nhật trạng thái";
  }

  if (notification.type === "post_commented") {
    const actorName = notification.actorId?.fullName || "Có người";
    return `${actorName} vừa bình luận vào bài viết của bạn`;
  }

  if (notification.type === "post_reported_under_review") {
    return "Bài viết của bạn đang được xem xét do có báo cáo";
  }

  return "Bạn có thông báo mới";
}

function getNotificationSubtext(notification) {
  if (notification.type === "order_status_updated") {
    return notification.orderId?.orderCode || "Đơn hàng";
  }
  if (notification.type === "post_commented" || notification.type === "post_reported_under_review") {
    return notification.postId?.title || "Bài viết liên quan";
  }
  return "";
}

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
              </nav>
            </SheetContent>
          </Sheet>

          <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Giỏ hàng" asChild>
            <Link to={ROUTES.cart}>
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </Link>
          </Button>

          {isAuthenticated && user ? (
            <>
              {canViewNotifications && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Thông báo">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground animate-in zoom-in-50">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[360px] p-0">
                    <div className="flex items-center justify-between border-b px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">Thông báo</span>
                        {unreadCount > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto gap-1 px-2 py-1 text-xs text-primary hover:text-primary"
                          onClick={handleReadAllNotifications}
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                          Đọc tất cả
                        </Button>
                      )}
                    </div>
                    <div className="max-h-[380px] overflow-y-auto">
                      {notificationsLoading ? (
                        <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang tải thông báo...
                        </div>
                      ) : notificationsError ? (
                        <div className="px-4 py-10 text-center text-sm text-destructive">Không thể tải thông báo.</div>
                      ) : notifications.length ? (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={cn(
                              "flex cursor-pointer items-start gap-3 border-b border-border/50 px-4 py-3 transition-colors hover:bg-accent/50 last:border-b-0",
                              !notification.readAt && "bg-primary/[0.03]"
                            )}
                            onClick={() => handleOpenNotification(notification)}
                          >
                            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted/80">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <p className={cn(
                                "text-sm leading-5",
                                notification.readAt ? "text-muted-foreground" : "font-medium text-foreground"
                              )}>
                                {formatNotificationMessage(notification)}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="line-clamp-1 text-xs text-muted-foreground">
                                  {getNotificationSubtext(notification)}
                                </p>
                                <span className="text-[10px] text-muted-foreground/70">•</span>
                                <span className="whitespace-nowrap text-[11px] text-muted-foreground/70">
                                  {formatRelativeTime(notification.createdAt)}
                                </span>
                              </div>
                            </div>
                            {!notification.readAt && (
                              <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 px-4 py-10">
                          <Bell className="h-8 w-8 text-muted-foreground/40" />
                          <p className="text-sm text-muted-foreground">Chưa có thông báo nào.</p>
                        </div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

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
                  <DropdownMenuItem asChild>
                    <Link to={ROUTES.addressBook} className="cursor-pointer">
                      <MapPin className="mr-2 h-4 w-4" />
                      Sổ địa chỉ
                    </Link>
                  </DropdownMenuItem>
                  {(user.role === "admin" || user.role === "business_manager" || user.role === "content_manager" || user.role === "business manager" || user.role === "content manager") && (
                    <DropdownMenuItem asChild>
                      <Link
                        to={
                          normalizedRole === "admin"
                            ? ROUTES.admin
                            : normalizedRole === "business_manager"
                              ? ROUTES.business
                              : ROUTES.contentDashboard
                        }
                        className="cursor-pointer"
                      >
                        <Store className="mr-2 h-4 w-4" />
                        Trang quản lý
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={ROUTES.myPosts} className="cursor-pointer">
                      <PenSquare className="mr-2 h-4 w-4" />
                      Bài viết của tôi
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
