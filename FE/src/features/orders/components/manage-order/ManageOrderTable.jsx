import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

function ManageOrderTable({ PAYMENT_STATUS_CONFIG, STATUS_LABELS, filteredOrders, formatDate, formatVND, getStatusClassName, handleCancelPendingOrder, handleConfirmReturn, handleUpdateStatus, isBusinessManager, isHybridPayment, loading, paginatedOrders, setSelectedOrder }) {
  return (
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
                          {isHybridPayment(order)
                            ? `Ví + ${order.paymentMethod === "COD" ? "COD" : "VNPay"}`
                            : order.paymentMethod === "COD" ? "COD" : "VNPay"}
                        </span>
                        {isHybridPayment(order) && (
                          <span className="text-[10px] text-violet-600 font-medium">
                            Ví: {formatVND(order.walletAmount || 0)}
                          </span>
                        )}
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
  );
}

export { ManageOrderTable };
