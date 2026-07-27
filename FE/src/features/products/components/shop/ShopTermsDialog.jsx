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
import { CheckCircle2, FileText, ShieldCheck } from "lucide-react";

function ShopTermsDialog({ MARKETPLACE_TERMS, acceptTerms, setTermsOpen, termsOpen }) {
  return (
<Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="overflow-hidden border-0 p-0 shadow-2xl sm:max-w-xl">
          <div className="bg-gradient-to-r from-primary via-green-600 to-emerald-500 px-5 py-4 text-white">
            <DialogHeader className="gap-2 text-left">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-inner">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold leading-tight">
                    Điều khoản mua sắm
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-xs leading-5 text-white/90">
                    Vui lòng đọc các điều khoản trước khi tiếp tục mua sắm tại Plantify.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="space-y-3 px-5 py-4 max-h-[55vh] overflow-y-auto">
            <div className="flex gap-2.5 rounded-lg border border-green-100 bg-green-50/80 p-3 text-xs leading-5 text-green-900">
              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <p>
                Các điều khoản này giúp Plantify xử lý đơn hàng rõ ràng, minh bạch và đúng thông tin khách hàng cung cấp.
              </p>
            </div>

            <ol className="grid gap-2">
              {MARKETPLACE_TERMS.map((term, index) => (
                <li
                  key={term}
                  className="flex gap-2.5 rounded-lg border border-border bg-white p-2.5 text-xs leading-5 shadow-sm"
                >
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="text-foreground">{term}</span>
                </li>
              ))}
            </ol>
          </div>

          <DialogFooter className="border-t bg-muted/40 px-5 py-3 sm:items-center sm:justify-between">
            <p className="text-[11px] text-muted-foreground">
              Bạn có thể đóng thông báo này bằng nút X để tiếp tục mua sắm.
            </p>
            <DialogClose asChild>
              <Button size="sm" className="gap-1.5 bg-gradient-to-r from-primary to-green-600 text-white" onClick={acceptTerms}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Tôi đã hiểu
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}

export { ShopTermsDialog };
