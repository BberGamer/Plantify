// HeaderUserMenu.jsx - Hiển thị menu tài khoản và các hành động của người dùng trên header
import { Link } from "react-router";
import {
  LogOut,
  MapPin,
  PenSquare,
  Sprout,
  Store,
  User,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/lib/constants";

function HeaderUserMenu({
  canViewNotifications,
  normalizedRole,
  onLogout,
  user,
}) {
  const canOpenManagerPage = [
    "admin",
    "business_manager",
    "content_manager",
    "business manager",
    "content manager",
  ].includes(user.role);

  return (
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
        {canViewNotifications ? (
          <DropdownMenuItem asChild>
            <Link to={ROUTES.myGarden} className="cursor-pointer">
              <Sprout className="mr-2 h-4 w-4" />
              My Garden
            </Link>
          </DropdownMenuItem>
        ) : null}
        {canOpenManagerPage && (
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
        <DropdownMenuItem asChild />
        <DropdownMenuItem asChild>
          <Link to={ROUTES.myPosts} className="cursor-pointer">
            <PenSquare className="mr-2 h-4 w-4" />
            Bài viết của tôi
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { HeaderUserMenu };
