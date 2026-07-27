// ManageOrderCancelDialog.jsx - Hiển thị hộp thoại xác nhận hủy đơn hàng
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function ManageOrderCancelDialog({ cancelOrderTarget, cancellationReason, handleConfirmCancellation, isCancelling, setCancelOrderTarget, setCancellationReason }) {
  return (
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
  );
}

export { ManageOrderCancelDialog };
