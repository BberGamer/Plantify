// ManageOrderPagination.jsx - Hiển thị điều hướng phân trang danh sách đơn hàng
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

function ManageOrderPagination({
  currentPage,
  itemCount,
  onPageChange,
  totalItems,
  totalPages,
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="manage-order-pagination">
      <span className="text-xs text-muted-foreground">
        Trang {currentPage} / {totalPages} · Hiển thị {itemCount} / {totalItems} đơn
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Trước
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
        >
          Sau
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export { ManageOrderPagination };
