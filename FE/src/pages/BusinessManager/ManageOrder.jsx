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
import { getAllOrders, updateOrder } from "@/features/orders/api";
import { useAuth } from "@/features/auth/hooks";
import { toast } from "sonner";

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
  return method === "COD" ? "Thanh toán khi nhận hàng" : "Chuyển khoản Internet Banking";
}

// === MAIN COMPONENT ===

function ManageOrder() {
  // === HOOKS - phải khai báo TẤT CẢ hook trước mọi conditional return (React Rules of Hooks) ===
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelOrderTarget, setCancelOrderTarget] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [orderPage, setOrderPage] = useState(1);

  // === FETCH DATA ===

  /**
   * Tải danh sách tất cả đơn hàng từ API
   */
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllOrders();
      setOrders(res.data?.data?.orders || []);
    } catch (err) {
      console.error("Lỗi fetch orders:", err);
      toast.error(err.response?.data?.message || err.message || "Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
      await updateOrder(orderId, { status: newStatus });
      toast.success(`Đã cập nhật: ${STATUS_LABELS[newStatus]}`);
      fetchOrders();
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
      setIsCancelling(true);
      const response = await updateOrder(orderId, {
        status: "cancelled",
        cancellationReason,
      });
      const refundedAmount = Number(response.data?.data?.order?.refundedAmount || 0);
      toast.success(
        refundedAmount > 0
          ? `Đã hủy đơn và hoàn ${formatVND(refundedAmount)} vào ví khách hàng.`
          : "Đã hủy đơn hàng thành công!"
      );
      setCancelOrderTarget(null);
      setCancellationReason("");
      await fetchOrders();
    } catch (err) {
      console.error("Lỗi hủy đơn hàng:", err);
      toast.error(err.response?.data?.message || err.message || "Hủy đơn hàng thất bại.");
    } finally {
      setIsCancelling(false);
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
      await updateOrder(orderId, {
        status: "cancelled",
        cancellationReason: "customer_return",
      });
      toast.success("Đã xác nhận hoàn trả và hủy đơn hàng!");
      fetchOrders();
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
      <Dialog
        open={Boolean(cancelOrderTarget)}
        onOpenChange={(open) => {
          if (!open && !isCancelling) {
            setCancelOrderTarget(null);
            setCancellationReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chọn lý do hủy đơn</DialogTitle>
            <DialogDescription>
              Đơn hàng {cancelOrderTarget?.orderCode}. Lý do này sẽ được hiển thị
              cho khách hàng.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <label className="text-sm font-medium">Lý do hủy đơn</label>
            <Select value={cancellationReason} onValueChange={setCancellationReason}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn một lý do" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="out_of_stock">Hết hàng</SelectItem>
                <SelectItem value="defective_product">Hàng lỗi</SelectItem>
                <SelectItem value="weather_incident">Sự cố thời tiết</SelectItem>
                <SelectItem value="no_carrier">Không có người vận chuyển</SelectItem>
              </SelectContent>
            </Select>

            {cancelOrderTarget?.paymentMethod === "BANK" &&
              cancelOrderTarget?.paymentStatus === "paid" && (
                <p className="rounded-lg bg-violet-50 p-3 text-sm text-violet-700">
                  Đơn đã thanh toán qua VNPay. Toàn bộ tiền sẽ tự động được hoàn
                  vào ví của khách hàng.
                </p>
              )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={isCancelling}
              onClick={() => setCancelOrderTarget(null)}
            >
              Đóng
            </Button>
            <Button
              className="bg-rose-600 text-white hover:bg-rose-700"
              disabled={!cancellationReason || isCancelling}
              onClick={handleConfirmCancellation}
            >
              {isCancelling ? "Đang hủy..." : "Xác nhận hủy đơn"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Chi tiết đơn hàng</DialogTitle>
                <DialogDescription>
                  Mã đơn {selectedOrder.orderCode} - đặt lúc {formatDateTime(selectedOrder.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <Card className="border-green-100 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Thông tin khách hàng</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="grid gap-1">
                      <span className="text-muted-foreground">Người nhận</span>
                      <span className="font-semibold">{selectedOrder.shippingInfo?.fullName || "Chưa có thông tin"}</span>
                    </div>
                    <div className="grid gap-1">
                      <span className="text-muted-foreground">Số điện thoại</span>
                      <span className="font-semibold">{selectedOrder.shippingInfo?.phone || "Chưa có thông tin"}</span>
                    </div>
                    <div className="grid gap-1">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-semibold">{selectedOrder.shippingInfo?.email || "Chưa có thông tin"}</span>
                    </div>
                    <div className="grid gap-1">
                      <span className="text-muted-foreground">Địa chỉ giao hàng</span>
                      <span className="font-semibold leading-6">{selectedOrder.shippingInfo?.address || "Chưa có thông tin"}</span>
                    </div>
                    {selectedOrder.shippingInfo?.notes && (
                      <div className="grid gap-1">
                        <span className="text-muted-foreground">Ghi chú</span>
                        <span className="leading-6">{selectedOrder.shippingInfo.notes}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-green-100 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Thanh toán và trạng thái</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Trạng thái đơn</span>
                      <Badge variant="outline" className={`font-semibold ${getStatusClassName(selectedOrder.status)}`}>
                        {STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Thanh toán</span>
                      {(() => {
                        const payConfig = PAYMENT_STATUS_CONFIG[selectedOrder.paymentStatus] || PAYMENT_STATUS_CONFIG.pending;
                        return (
                          <Badge variant="outline" className={`font-semibold ${payConfig.className}`}>
                            {payConfig.label}
                          </Badge>
                        );
                      })()}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Phương thức</span>
                      <span className="font-semibold text-right">{getPaymentMethodLabel(selectedOrder.paymentMethod)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span className="font-semibold">{formatVND(selectedOrder.subtotal || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Phí vận chuyển</span>
                      <span className="font-semibold">{formatVND(selectedOrder.shippingFee || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-base">
                      <span className="font-semibold">Tổng thanh toán</span>
                      <span className="text-xl font-bold text-primary">{formatVND(selectedOrder.total || 0)}</span>
                    </div>
                    {selectedOrder.cancellationReason && (
                      <div className="rounded-lg border border-rose-100 bg-rose-50 p-3">
                        <span className="text-muted-foreground">Lý do hủy: </span>
                        <span className="font-semibold text-rose-700">
                          {CANCELLATION_REASON_LABELS[selectedOrder.cancellationReason] ||
                            selectedOrder.cancellationReason}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="border-green-100 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Sản phẩm trong đơn</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(selectedOrder.items || []).map((item, index) => (
                    <div key={`${item.productId}-${item.name}-${index}`} className="flex gap-3 rounded-lg border border-green-100 bg-green-50/40 p-3">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400"}
                        alt={item.name}
                        className="h-16 w-16 flex-shrink-0 rounded-md border object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="line-clamp-2 font-semibold text-foreground">{item.name}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatVND(item.price)} x {item.quantity}
                        </p>
                      </div>
                      <div className="text-right font-bold text-primary">
                        {formatVND(item.lineTotal || item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </DialogContent>
      </Dialog>

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
      <Card className="border-green-200/60 bg-white/95 shadow-sm">
        <CardHeader className="border-b border-green-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-xl">Bộ lọc đơn hàng</CardTitle>
            </div>
            <Badge variant="outline" className="w-fit border-green-200 bg-green-50 text-green-700">
              Bộ lọc nâng cao
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            {/* Tìm kiếm */}
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo mã đơn hoặc khách hàng"
                className="pl-10"
              />
            </div>

            {/* Lọc theo trạng thái đơn */}
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái: Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Trạng thái: Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="packing">Đang đóng hàng</SelectItem>
                  <SelectItem value="sented">Đã gửi hàng</SelectItem>
                  <SelectItem value="succeeded">Nhận hàng thành công</SelectItem>
                  <SelectItem value="returning">Đang hoàn trả</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lọc theo thanh toán */}
            <div>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Thanh toán: Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Thanh toán: Tất cả</SelectItem>
                  <SelectItem value="pending">Chưa thanh toán</SelectItem>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="failed">Thanh toán lỗi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-green-100 bg-green-50/50 hover:bg-green-50/50">
                <TableHead className="px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Mã đơn
                </TableHead>
                <TableHead className="px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Khách hàng
                </TableHead>
                <TableHead className="px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Tổng tiền
                </TableHead>
                <TableHead className="px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Thanh toán
                </TableHead>
                <TableHead className="px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Trạng thái
                </TableHead>
                <TableHead className="px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Ngày đặt
                </TableHead>
                <TableHead className="px-4 text-right text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Hành động
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow className="border-green-100/80 hover:bg-transparent">
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                      Đang tải danh sách đơn hàng...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow className="border-green-100/80 hover:bg-transparent">
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Không tìm thấy đơn hàng nào.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow key={order._id || order.id} className="border-green-100/80 hover:bg-green-50/30">
                    {/* Mã đơn */}
                    <TableCell className="px-4 py-4 font-semibold text-slate-800">
                      {order.orderCode}
                    </TableCell>

                    {/* Khách hàng */}
                    <TableCell className="px-4 py-4 font-medium text-slate-700">
                      {order.shippingInfo?.fullName || "Khách vãng lai"}
                    </TableCell>

                    {/* Tổng tiền */}
                    <TableCell className="px-4 py-4 font-bold text-slate-800">
                      {formatVND(order.total)}
                    </TableCell>

                    {/* Thanh toán */}
                    <TableCell className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-slate-700">
                          {order.paymentMethod === "COD" ? "COD" : "VNPay"}
                        </span>
                        {(() => {
                          const payConfig = PAYMENT_STATUS_CONFIG[order.paymentStatus] || PAYMENT_STATUS_CONFIG.pending;
                          return (
                            <Badge variant="outline" className={`w-fit text-[10px] px-1.5 py-0.25 font-semibold ${payConfig.className}`}>
                              {payConfig.label}
                            </Badge>
                          );
                        })()}
                      </div>
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell className="px-4 py-4">
                      <Badge variant="outline" className={`px-2 py-0.5 text-xs font-semibold ${getStatusClassName(order.status)}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </Badge>
                    </TableCell>

                    {/* Ngày đặt */}
                    <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                      {formatDate(order.createdAt)}
                    </TableCell>

                    {/* Hành động */}
                    <TableCell className="px-4 py-4">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 font-medium transition-all duration-200"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          Chi tiết
                        </Button>
                        {/* pending → Đóng hàng hoặc Hủy */}
                        {order.status === "pending" && (
                          <>
                            {isBusinessManager && (
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all duration-200"
                                onClick={() => handleUpdateStatus(order._id || order.id, "packing")}
                              >
                                <Package className="mr-1.5 h-3.5 w-3.5" />
                                Đóng hàng
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 font-medium transition-all duration-200"
                              onClick={() => handleCancelPendingOrder(order)}
                            >
                              <Ban className="mr-1.5 h-3.5 w-3.5" />
                              Hủy đơn
                            </Button>
                          </>
                        )}

                        {/* packing → Gửi hàng */}
                        {isBusinessManager && order.status === "packing" && (
                          <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all duration-200"
                            onClick={() => handleUpdateStatus(order._id || order.id, "sented")}
                          >
                            <Truck className="mr-1.5 h-3.5 w-3.5" />
                            Gửi hàng
                          </Button>
                        )}

                        {/* returning → Xác nhận hoàn trả */}
                        {isBusinessManager && order.status === "returning" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 font-medium transition-all duration-200"
                            onClick={() => handleConfirmReturn(order)}
                          >
                            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                            Xác nhận hoàn trả
                          </Button>
                        )}

                        {/* Trạng thái cuối - không có hành động */}
                        {["sented", "succeeded", "cancelled"].includes(order.status) && (
                          <span className="text-xs text-muted-foreground italic font-light pr-2">
                            {order.status === "sented" ? "Chờ khách xác nhận" : "Không có hành động"}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

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
