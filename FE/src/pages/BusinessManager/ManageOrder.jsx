// ManageOrder.jsx - Trang giao diện quản lý đơn hàng cho business manager
import { useState, useEffect, useCallback, useMemo } from "react";
import { Navigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";





import {
  useManageOrders,
  useOrderRealtime,
} from "@/features/orders/hooks";
import { useAuth } from "@/features/auth/hooks";
import { toast } from "sonner";
import { ManageOrderCancelDialog } from "@/features/orders/components/manage-order/ManageOrderCancelDialog";
import { ManageOrderDetailsDialog } from "@/features/orders/components/manage-order/ManageOrderDetailsDialog";
import { ManageOrderFilters } from "@/features/orders/components/manage-order/ManageOrderFilters";
import { ManageOrderPagination } from "@/features/orders/components/manage-order/ManageOrderPagination";
import { ManageOrderStats } from "@/features/orders/components/manage-order/ManageOrderStats";
import { ManageOrderTable } from "@/features/orders/components/manage-order/ManageOrderTable";
import {
  ORDER_PAGE_SIZE,
  STATUS_LABELS,
  formatVND,
} from "@/features/orders/manageOrder.utils";
import "@/styles/ManageOrder.css";

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
    <div className="manage-order-page">
      <ManageOrderCancelDialog
        cancelOrderTarget={cancelOrderTarget}
        cancellationReason={cancellationReason}
        handleConfirmCancellation={handleConfirmCancellation}
        isCancelling={isCancelling}
        setCancelOrderTarget={setCancelOrderTarget}
        setCancellationReason={setCancellationReason}
      />

      <ManageOrderDetailsDialog
        onClose={() => setSelectedOrder(null)}
        selectedOrder={selectedOrder}
      />

      {/* Header */}
      <section className="manage-order-header">
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
      <ManageOrderStats orders={orders} />

      {/* Filters */}
      <ManageOrderFilters
        paymentFilter={paymentFilter}
        search={search}
        setPaymentFilter={setPaymentFilter}
        setSearch={setSearch}
        setStatusFilter={setStatusFilter}
        statusFilter={statusFilter}
      />

      {/* Order Table */}
      <Card className="manage-order-list">
        <CardHeader className="manage-order-list-header">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl text-foreground">Danh sách đơn hàng</CardTitle>
            </div>
            <Badge className="border-transparent bg-primary/10 text-primary hover:bg-primary/10">
              {filteredOrders.length} đơn hàng
            </Badge>
          </div>
        </CardHeader>

        <ManageOrderTable
          isBusinessManager={isBusinessManager}
          isEmpty={filteredOrders.length === 0}
          loading={loading}
          onCancel={handleCancelPendingOrder}
          onConfirmReturn={handleConfirmReturn}
          onSelect={setSelectedOrder}
          onStatusUpdate={handleUpdateStatus}
          orders={paginatedOrders}
        />

        <ManageOrderPagination
          currentPage={safeOrderPage}
          itemCount={paginatedOrders.length}
          onPageChange={setOrderPage}
          totalItems={filteredOrders.length}
          totalPages={totalOrderPages}
        />
      </Card>
    </div>
  );
}

export { ManageOrder };
