// ManageOrder.jsx - Trang giao diện quản lý đơn hàng cho business manager
import { useState, useEffect, useCallback, useMemo } from "react";
import { Navigate } from "react-router";
import { DashboardCard } from "@/components/common/DashboardCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Search,
  ShoppingBag,
  Clock3,
  PackageCheck,
  Ban,
  Package,
  Truck,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  useManageOrders,
  useOrderRealtime,
} from "@/features/orders/hooks";
import { useAuth } from "@/features/auth/hooks";
import { toast } from "sonner";
import { ManageOrderCancelDialog } from "@/features/orders/components/manage-order/ManageOrderCancelDialog";
import { ManageOrderDetailsDialog } from "@/features/orders/components/manage-order/ManageOrderDetailsDialog";
import { ManageOrderFilters } from "@/features/orders/components/manage-order/ManageOrderFilters";
import { ManageOrderTable } from "@/features/orders/components/manage-order/ManageOrderTable";

/** Số đơn hàng hiển thị trên mỗi trang */
const ORDER_PAGE_SIZE = 8;

// === LABEL & STYLE CONFIG ===

/**
 * Nhãn hiển thị tiếng Việt cho từng trạng thái đơn hàng
 * Khớp với enum trong order.model.js
 */
const STATUS_LABELS = {
  pending: "Chờ xử lý",
  packing: "Đang đóng hàng",
  sented: "Đã gửi hàng",
  succeeded: "Nhận hàng thành công",
  returning: "Đang hoàn trả",
  cancelled: "Đã hủy",
};

const CANCELLATION_REASON_LABELS = {
  out_of_stock: "Hết hàng",
  defective_product: "Hàng lỗi",
  weather_incident: "Sự cố thời tiết",
  no_carrier: "Không có người vận chuyển",
  customer_return: "Khách hàng hoàn trả",
  customer_cancelled: "Khách hàng chủ động hủy",
  payment_failed: "Thanh toán không thành công",
};

const PAYMENT_STATUS_CONFIG = {
  pending: {
    label: "Chưa thanh toán",
    className: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-50",
  },
  paid: {
    label: "Đã thanh toán",
    className: "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-50",
  },
  failed: {
    label: "Thanh toán lỗi",
    className: "border-red-200 bg-red-50 text-red-700 hover:bg-red-50",
  },
  refunded: {
    label: "Đã hoàn vào ví",
    className: "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-50",
  },
};

/**
 * Trả về className badge ứng với mỗi trạng thái đơn hàng
 * @param {string} status - Trạng thái đơn hàng
 * @returns {string} CSS class cho badge
 */
function getStatusClassName(status) {
  switch (status) {
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50";
    case "packing":
      return "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50";
    case "sented":
      return "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-50";
    case "succeeded":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50";
    case "returning":
      return "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-50";
    case "cancelled":
      return "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50";
    default:
      return "border-border bg-muted text-muted-foreground hover:bg-muted";
  }
}

/** Format giá tiền sang VND */
function formatVND(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/** Format ngày đặt hàng sang định dạng vi-VN */
function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN");
}

function formatDateTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPaymentMethodLabel(method) {
  return method === "COD" ? "Thanh toán khi nhận hàng (COD)" : "Chuyển khoản Internet Banking (VNPay)";
}

/**
 * Kiểm tra đơn hàng có dùng kết hợp ví + phương thức bên ngoài hay không
 * @param {Object} order - Đơn hàng
 * @returns {boolean}
 */
function isHybridPayment(order) {
  return Number(order.walletAmount || 0) > 0 && Number(order.externalAmount || 0) > 0;
}

// === MAIN COMPONENT ===

function ManageOrder() {
  // === HOOKS - phải khai báo TẤT CẢ hook trước mọi conditional return (React Rules of Hooks) ===
  const { user } = useAuth();
  const {
    loading,
    orders,
    cancelOrder,
    cancelling: isCancelling,
    setOrders,
    updateStatus,
  } = useManageOrders();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelOrderTarget, setCancelOrderTarget] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [orderPage, setOrderPage] = useState(1);

  const handleOrderUpdated = useCallback((updatedOrder) => {
    const updatedId = updatedOrder._id || updatedOrder.id;

    setOrders((currentOrders) => {
      const orderExists = currentOrders.some(
        (order) => (order._id || order.id) === updatedId
      );

      if (!orderExists) return [updatedOrder, ...currentOrders];

      return currentOrders.map((order) =>
        (order._id || order.id) === updatedId ? updatedOrder : order
      );
    });
    setSelectedOrder((currentOrder) =>
      currentOrder && (currentOrder._id || currentOrder.id) === updatedId
        ? updatedOrder
        : currentOrder
    );
    setCancelOrderTarget((currentOrder) =>
      currentOrder && (currentOrder._id || currentOrder.id) === updatedId
        ? null
        : currentOrder
    );
  }, []);

  useOrderRealtime(
    handleOrderUpdated,
    user?.role?.toLowerCase() === "business manager"
  );

  // Kiểm tra quyền truy cập SAU khi đã khai báo đủ hooks
  if (!["business manager", "content manager"].includes(user?.role?.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }
  const isBusinessManager = user?.role?.toLowerCase() === "business manager";



  // === HANDLERS ===

  /**
   * Cập nhật trạng thái đơn hàng thông qua API
   * @param {string} orderId - ID đơn hàng
   * @param {string} newStatus - Trạng thái mới
   */
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateStatus(orderId, newStatus);
      toast.success(`Đã cập nhật: ${STATUS_LABELS[newStatus]}`);
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      toast.error(err.response?.data?.message || err.message || "Cập nhật thất bại.");
    }
  };

  /**
   * Xử lý hủy đơn hàng từ trạng thái pending
   * - Nếu đã thanh toán (paid): hỏi xác nhận hoàn tiền
   * - Nếu chưa thanh toán: hủy ngay
   * @param {Object} order - Đối tượng đơn hàng
   */
  const handleCancelPendingOrder = (order) => {
    setCancelOrderTarget(order);
    setCancellationReason("");
  };

  const handleConfirmCancellation = async () => {
    if (!cancelOrderTarget || !cancellationReason) {
      toast.error("Vui lòng chọn lý do hủy đơn hàng.");
      return;
    }

    const orderId = cancelOrderTarget._id || cancelOrderTarget.id;
    try {
      const response = await cancelOrder(orderId, cancellationReason);
      const refundedAmount = Number(response.data?.data?.order?.refundedAmount || 0);
      toast.success(
        refundedAmount > 0
          ? `Đã hủy đơn và hoàn ${formatVND(refundedAmount)} vào ví khách hàng.`
          : "Đã hủy đơn hàng thành công!"
      );
      setCancelOrderTarget(null);
      setCancellationReason("");
    } catch (err) {
      console.error("Lỗi hủy đơn hàng:", err);
      toast.error(err.response?.data?.message || err.message || "Hủy đơn hàng thất bại.");
    }
  };

  /**
   * Xử lý xác nhận hoàn trả từ trạng thái returning
   * BM xác nhận đã hoàn tiền và nhận lại hàng → chuyển sang cancelled
   * @param {Object} order - Đối tượng đơn hàng
   */
  const handleConfirmReturn = async (order) => {
    const orderId = order._id || order.id;
    const confirmed = window.confirm(
      `Xác nhận hoàn trả đơn hàng "${order.orderCode}".\n\nBạn đã xác nhận hoàn tiền cho khách hàng và nhận lại hàng chưa?\n\nNhấn OK để xác nhận hủy đơn.`
    );
    if (!confirmed) return;

    try {
      await cancelOrder(orderId, "customer_return");
      toast.success("Đã xác nhận hoàn trả và hủy đơn hàng!");
    } catch (err) {
      console.error("Lỗi xác nhận hoàn trả:", err);
      toast.error(err.response?.data?.message || err.message || "Thao tác thất bại.");
    }
  };

  // === STATS ===

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const succeededOrders = orders.filter(o => o.status === "succeeded").length;

  const orderStats = [
    {
      title: "Tổng đơn hàng",
      value: String(totalOrders),
      icon: ShoppingBag,
    },
    {
      title: "Đơn chờ xử lý",
      value: String(pendingOrders),
      icon: Clock3,
    },
    {
      title: "Đơn hoàn thành",
      value: String(succeededOrders),
      icon: PackageCheck,
    }
  ];

  // === FILTER ===

  const filteredOrders = useMemo(() => orders.filter(order => {
    const matchesSearch =
      order.orderCode?.toLowerCase().includes(search.toLowerCase()) ||
      order.shippingInfo?.fullName?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || order.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  }), [orders, search, statusFilter, paymentFilter]);

  // === PAGINATION ===

  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / ORDER_PAGE_SIZE));
  const safeOrderPage = Math.min(orderPage, totalOrderPages);
  const paginatedOrders = useMemo(
    () => filteredOrders.slice(
      (safeOrderPage - 1) * ORDER_PAGE_SIZE,
      safeOrderPage * ORDER_PAGE_SIZE
    ),
    [filteredOrders, safeOrderPage]
  );

  // Mỗi lần filter/search thay đổi → quay về trang 1
  useEffect(() => {
    setOrderPage(1);
  }, [search, statusFilter, paymentFilter]);

  // === RENDER ===

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ManageOrderCancelDialog cancelOrderTarget={cancelOrderTarget} cancellationReason={cancellationReason} handleConfirmCancellation={handleConfirmCancellation} isCancelling={isCancelling} setCancelOrderTarget={setCancelOrderTarget} setCancellationReason={setCancellationReason} />

      <ManageOrderDetailsDialog CANCELLATION_REASON_LABELS={CANCELLATION_REASON_LABELS} PAYMENT_STATUS_CONFIG={PAYMENT_STATUS_CONFIG} STATUS_LABELS={STATUS_LABELS} formatDateTime={formatDateTime} formatVND={formatVND} getPaymentMethodLabel={getPaymentMethodLabel} getStatusClassName={getStatusClassName} isHybridPayment={isHybridPayment} selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} />

      {/* Header */}
      <section className="rounded-3xl border border-green-100 bg-gradient-to-r from-green-50 via-background to-emerald-50 p-6 shadow-sm sm:p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Quản lý đơn hàng
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Xem và xử lý tất cả đơn hàng của khách hàng
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {orderStats.map((stat) => (
          <DashboardCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </section>

      {/* Filters */}
      <ManageOrderFilters paymentFilter={paymentFilter} search={search} setPaymentFilter={setPaymentFilter} setSearch={setSearch} setStatusFilter={setStatusFilter} statusFilter={statusFilter} />

      {/* Order Table */}
      <Card className="overflow-hidden border-green-200/60 bg-white/95 shadow-sm">
        <CardHeader className="border-b border-green-100 bg-gradient-to-r from-white to-green-50/80">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl text-foreground">Danh sách đơn hàng</CardTitle>
            </div>
            <Badge className="border-transparent bg-primary/10 text-primary hover:bg-primary/10">
              {filteredOrders.length} đơn hàng
            </Badge>
          </div>
        </CardHeader>

        <ManageOrderTable PAYMENT_STATUS_CONFIG={PAYMENT_STATUS_CONFIG} STATUS_LABELS={STATUS_LABELS} filteredOrders={filteredOrders} formatDate={formatDate} formatVND={formatVND} getStatusClassName={getStatusClassName} handleCancelPendingOrder={handleCancelPendingOrder} handleConfirmReturn={handleConfirmReturn} handleUpdateStatus={handleUpdateStatus} isBusinessManager={isBusinessManager} isHybridPayment={isHybridPayment} loading={loading} paginatedOrders={paginatedOrders} setSelectedOrder={setSelectedOrder} />

        {totalOrderPages > 1 && (
          <div className="flex flex-col gap-2 border-t border-green-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-muted-foreground">
              Trang {safeOrderPage} / {totalOrderPages} · Hiển thị {paginatedOrders.length} / {filteredOrders.length} đơn
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOrderPage((page) => Math.max(1, page - 1))}
                disabled={safeOrderPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOrderPage((page) => Math.min(totalOrderPages, page + 1))}
                disabled={safeOrderPage >= totalOrderPages}
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export { ManageOrder };
