// BrowseResults.jsx - Hiển thị danh sách kết quả và phân trang cây khám phá
import { Link } from "react-router";
import { PlantCard } from "@/components/common/PlantCard";
import { Button } from "@/components/ui/button";
import { Filter, Loader2 } from "lucide-react";

function BrowseResults({
  currentPage,
  error,
  hasActiveFilters,
  loading,
  onClearFilters,
  onPageChange,
  pages,
  plantCards,
  plantsCount,
  total,
}) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground">
          {loading ? "Đang tìm kiếm..." : (
            <>
              Hiển thị{" "}
              <span className="font-semibold text-foreground">
                {total || plantsCount}
              </span>{" "}
              kết quả
            </>
          )}
        </p>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <Filter className="mr-2 h-4 w-4" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="col-span-full py-20 text-center">
            <p className="mb-4 text-lg text-red-500">Đã xảy ra lỗi: {error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </div>
        ) : plantCards.length > 0 ? (
          plantCards.map((plant) => (
            <Link key={plant.id} to={`/plant/${plant.id}`}>
              <PlantCard {...plant} />
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="mb-4 text-lg text-muted-foreground">
              Không tìm thấy cây cảnh nào phù hợp
            </p>
            <p className="text-sm text-muted-foreground">
              Thử từ khóa khác hoặc xóa bộ lọc để xem tất cả cây cảnh
            </p>
          </div>
        )}
      </div>

      {!loading && plantsCount > 0 && pages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Trước
          </Button>
          <div className="flex gap-1">
            {Array.from({ length: pages }, (_, index) => index + 1).map((pageNumber) => (
              <Button
                key={pageNumber}
                variant={pageNumber === currentPage ? "default" : "outline"}
                size="icon"
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            disabled={currentPage >= pages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Sau
          </Button>
        </div>
      )}
    </>
  );
}

export { BrowseResults };
