import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, CheckCircle2, FileText, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";

function CartTermsDialog({ CART_TERMS, setTermsOpen, termsOpen }) {
  return (
<Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="overflow-hidden border-0 p-0 shadow-2xl sm:max-w-2xl">
          <div className="bg-gradient-to-r from-primary via-green-600 to-emerald-500 px-6 py-6 text-white">
            <DialogHeader className="gap-4 text-left">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-inner">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold leading-tight">
                    Điều khoản mua sắm
                  </DialogTitle>
                  <DialogDescription className="mt-2 text-sm leading-6 text-white/90">
                    Vui lòng đọc các điều khoản trước khi tiếp tục thanh toán tại Plantify.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="space-y-5 px-6 py-5">
            <div className="flex gap-3 rounded-lg border border-green-100 bg-green-50/80 p-4 text-sm text-green-900">
              <FileText className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <p>
                Các điều khoản này giúp Plantify xử lý đơn hàng rõ ràng, minh bạch và đúng thông tin khách hàng cung cấp.
              </p>
            </div>

            <ol className="grid gap-3">
              {CART_TERMS.map((term, index) => (
                <li
                  key={term}
                  className="flex gap-3 rounded-lg border border-border bg-white p-3 text-sm leading-6 shadow-sm"
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="text-foreground">{term}</span>
                </li>
              ))}
            </ol>
          </div>

          <DialogFooter className="border-t bg-muted/40 px-6 py-4 sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Bạn có thể đóng thông báo này bằng nút X để quay lại giỏ hàng.
            </p>
            <DialogClose asChild>
              <Button className="gap-2 bg-gradient-to-r from-primary to-green-600 text-white">
                <CheckCircle2 className="h-4 w-4" />
                Tôi đã hiểu
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}

export { CartTermsDialog };
