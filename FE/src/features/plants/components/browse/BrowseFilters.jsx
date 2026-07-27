// BrowseFilters.jsx - Hiển thị bộ lọc tìm kiếm cây trên trang khám phá
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

function BrowseFilters({
  availableTags,
  localSearch,
  onSearchChange,
  onSearchSubmit,
  onTagClick,
  onToggleTags,
  remainingTagsCount,
  showAllTags,
  tag,
  tagLabel,
  visibleTags,
}) {
  return (
    <div className="mb-10 space-y-6">
      <form
        onSubmit={onSearchSubmit}
        className="relative flex items-center gap-2 rounded-2xl border border-border bg-white p-2 shadow-lg"
      >
        <Search className="pointer-events-none absolute left-5 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên cây hoặc bệnh cây..."
          value={localSearch}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-12 border-0 pl-12 text-lg text-foreground focus-visible:ring-0"
        />
        <Button
          type="submit"
          size="lg"
          className="rounded-xl bg-gradient-to-r from-primary to-green-600 text-white"
        >
          Tìm kiếm
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={!tag ? "default" : "secondary"}
          className="cursor-pointer px-4 py-2 transition-colors hover:bg-primary hover:text-white"
          onClick={() => onTagClick("")}
        >
          Tất cả
        </Badge>
        {visibleTags.map((item) => (
          <Badge
            key={item}
            variant={tag === item ? "default" : "secondary"}
            className="cursor-pointer px-4 py-2 transition-colors animate-in fade-in slide-in-from-top-1 hover:bg-primary hover:text-white"
            onClick={() => onTagClick(item)}
          >
            {tagLabel[item] || item}
          </Badge>
        ))}
        {availableTags.length > 8 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleTags}
            className="h-auto gap-1 px-3 py-2 text-sm font-medium text-primary hover:text-primary"
          >
            {showAllTags ? (
              <><ChevronUp className="h-4 w-4" />Thu gọn</>
            ) : (
              <><ChevronDown className="h-4 w-4" />Xem thêm ({remainingTagsCount})</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export { BrowseFilters };
