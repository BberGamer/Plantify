import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  CANCELLATION_REASON_LABELS,
  PAYMENT_STATUS_CONFIG,
  STATUS_LABELS,
  formatDateTime,
  formatVND,
  getPaymentMethodLabel,
  getStatusClassName,
  isHybridPayment,
} from "@/features/orders/manageOrder.utils";

function ManageOrderDetailsDialog({ onClose, selectedOrder }) {
  return (
<Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => !open && onClose()}>
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
                      <span className="font-semibold text-right">
                        {isHybridPayment(selectedOrder)
                          ? `Ví + ${selectedOrder.paymentMethod === "COD" ? "COD" : "VNPay"}`
                          : getPaymentMethodLabel(selectedOrder.paymentMethod)}
                      </span>
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

                    {/* Breakdown thanh toán kết hợp ví + VNPay/COD */}
                    {isHybridPayment(selectedOrder) && (
                      <div className="rounded-lg border border-violet-100 bg-violet-50/60 p-3 space-y-2">
                        <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide">Chi tiết nguồn thanh toán</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-violet-700">
                          <span
                            className="
                              inline-flex h-5 w-5 items-center justify-center rounded-full
                              bg-violet-200 text-[10px] font-bold text-violet-800
                            "
                          >
                            Ví
                          </span>
                            Thanh toán từ ví
                          </span>
                          <span className="font-semibold text-violet-800">{formatVND(selectedOrder.walletAmount || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold">
                              {selectedOrder.paymentMethod === "COD" ? "C" : "V"}
                            </span>
                            {selectedOrder.paymentMethod === "COD" ? "Thanh toán khi nhận hàng (COD)" : "Chuyển khoản VNPay"}
                          </span>
                          <span className="font-semibold text-slate-800">{formatVND(selectedOrder.externalAmount || 0)}</span>
                        </div>
                      </div>
                    )}

                    {/* Hiển thị khi chỉ dùng ví hoàn toàn */}
                    {Number(selectedOrder.walletAmount || 0) > 0 && !isHybridPayment(selectedOrder) && (
                      <div className="rounded-lg border border-violet-100 bg-violet-50/60 p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-violet-700">
                          <span
                            className="
                              inline-flex h-5 w-5 items-center justify-center rounded-full
                              bg-violet-200 text-[10px] font-bold text-violet-800
                            "
                          >
                            Ví
                          </span>
                            Thanh toán 100% từ ví
                          </span>
                          <span className="font-semibold text-violet-800">{formatVND(selectedOrder.walletAmount || 0)}</span>
                        </div>
                      </div>
                    )}

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
  );
}

export { ManageOrderDetailsDialog };
