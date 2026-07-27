// NotificationDropdown.jsx - Hiển thị danh sách thông báo và thao tác đọc trên header
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  Droplets,
  Loader2,
  MessageCircle,
  Package,
  Sprout,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getPlantCareNotificationMessage,
  getPlantCareNotificationSubtext,
  isPlantCareNotification,
} from "@/features/notifications/notification.utils";

/** Định dạng thời gian tương đối cho notification item. @param {string|Date} dateString - Thời điểm tạo. @returns {string} Chuỗi thời gian tương đối hoặc ngày. */
function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffSeconds = Math.floor((now - date) / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

/** Kiểm tra thông báo cập nhật đơn có nội dung hoàn tiền vào ví. @param {Object} notification - Thông báo. @returns {boolean} Kết quả phân loại. */
function isRefundNotification(notification) {
  return notification.type === "order_status_updated"
    && typeof notification.message === "string"
    && notification.message.toLocaleLowerCase("vi-VN").includes("vào ví");
}

/** Chọn icon theo loại thông báo và trường hợp hoàn tiền. @param {Object} notification - Thông báo. @returns {JSX.Element} Icon tương ứng. */
function getNotificationIcon(notification) {
  if (isRefundNotification(notification)) {
    return <Wallet className="h-4 w-4 text-violet-500" />;
  }
  const icons = {
    plant_watering_due: <Droplets className="h-4 w-4 text-sky-500" />,
    plant_fertilizing_due: <Sprout className="h-4 w-4 text-emerald-600" />,
    order_status_updated: <Package className="h-4 w-4 text-blue-500" />,
    post_commented: <MessageCircle className="h-4 w-4 text-green-500" />,
    post_reported_under_review: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  };
  return icons[notification.type]
    || <Bell className="h-4 w-4 text-muted-foreground" />;
}

/** Tạo nội dung chính của thông báo từ type và entity đã populate. @param {Object} notification - Thông báo. @returns {string} Nội dung hiển thị. */
function formatNotificationMessage(notification) {
  if (isPlantCareNotification(notification)) {
    return getPlantCareNotificationMessage(notification);
  }
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

/** Tạo dòng phụ cho thông báo từ cây, đơn hàng hoặc bài viết liên quan. @param {Object} notification - Thông báo. @returns {string} Nội dung phụ. */
function getNotificationSubtext(notification) {
  if (isPlantCareNotification(notification)) {
    return getPlantCareNotificationSubtext(notification);
  }
  if (notification.type === "order_status_updated") {
    return notification.orderId?.orderCode || "Đơn hàng";
  }
  if (
    notification.type === "post_commented"
    || notification.type === "post_reported_under_review"
  ) {
    return notification.postId?.title || "Bài viết liên quan";
  }
  return "";
}

/**
 * Hiển thị danh sách thông báo, trạng thái đọc và các action tương ứng.
 * @param {Object} props - Component props.
 * @returns {JSX.Element} Dropdown thông báo.
 */
function NotificationDropdown({
  error,
  loading,
  notifications,
  onOpenNotification,
  onReadAll,
  unreadCount,
}) {
  return (
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
              onClick={onReadAll}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Đọc tất cả
            </Button>
          )}
        </div>
        <div className="max-h-[380px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải thông báo...
            </div>
          ) : error ? (
            <div className="px-4 py-10 text-center text-sm text-destructive">
              Không thể tải thông báo.
            </div>
          ) : notifications.length ? (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 border-b border-border/50 px-4 py-3 transition-colors hover:bg-accent/50 last:border-b-0",
                  !notification.readAt && "bg-primary/[0.03]",
                  isRefundNotification(notification) && !notification.readAt && "bg-violet-50/60"
                )}
                onClick={() => onOpenNotification(notification)}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                    isRefundNotification(notification) ? "bg-violet-100" : "bg-muted/80"
                  )}
                >
                  {getNotificationIcon(notification)}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p
                    className={cn(
                      "text-sm leading-5",
                      notification.readAt
                        ? "text-muted-foreground"
                        : "font-medium text-foreground"
                    )}
                  >
                    {formatNotificationMessage(notification)}
                  </p>
                  {isRefundNotification(notification) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                      <Wallet className="h-2.5 w-2.5" />
                      Tiền đã hoàn vào ví
                    </span>
                  )}
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
                  <div
                    className={cn(
                      "mt-2 h-2 w-2 flex-shrink-0 rounded-full",
                      isRefundNotification(notification) ? "bg-violet-500" : "bg-primary"
                    )}
                  />
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
  );
}

export { NotificationDropdown };
