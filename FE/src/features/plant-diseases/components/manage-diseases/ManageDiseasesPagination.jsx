// ManageDiseasesPagination.jsx - Hiển thị điều hướng phân trang danh sách bệnh cây
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

function ManageDiseasesPagination({ loading, onPageChange, page, pages }) {
  if (loading || pages <= 1) return null;

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      <Button
        variant="outline"
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(page - 1, 1))}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Trước
      </Button>
      <div className="flex gap-1">
        {Array.from({ length: pages }, (_, index) => index + 1).map((pageNumber) => (
          <Button
            key={pageNumber}
            variant={pageNumber === page ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}
      </div>
      <Button
        variant="outline"
        disabled={page >= pages}
        onClick={() => onPageChange(Math.min(page + 1, pages))}
      >
        Sau
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}

export { ManageDiseasesPagination };
