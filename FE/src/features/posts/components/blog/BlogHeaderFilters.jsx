// BlogHeaderFilters.jsx - Hiển thị tiêu đề, tìm kiếm và bộ lọc bài viết
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PenSquare, Search, X } from "lucide-react";

function BlogHeaderFilters({
  categories,
  hasActiveFilters,
  onClearFilters,
  onCreatePost,
  onSearchChange,
  onSelectCategory,
  searchTerm,
  selectedCategory,
}) {
  return (
    <>
      <div className="blog-page-header">
        <div>
          <h1 className="blog-page-title">Blog & Cộng đồng</h1>
          <p className="blog-page-subtitle">
            Kiến thức, kinh nghiệm và câu chuyện từ cộng đồng yêu cây cảnh
          </p>
        </div>
        <Button
          type="button"
          size="icon"
          className="self-end rounded-full shadow-md sm:self-start"
          onClick={onCreatePost}
          aria-label="Tạo bài viết mới"
        >
          <PenSquare className="h-5 w-5" />
        </Button>
      </div>

      <div className="blog-filter-section">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-12 pl-12 text-lg"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={
                (!selectedCategory && category === categories[0])
                  || selectedCategory === category
                  ? "default"
                  : "secondary"
              }
              className="cursor-pointer px-4 py-2 transition-colors hover:bg-primary hover:text-white"
              onClick={() => onSelectCategory(category)}
            >
              {category}
            </Badge>
          ))}

          {hasActiveFilters && (
            <Button type="button" variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="mr-2 h-4 w-4" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

export { BlogHeaderFilters };
