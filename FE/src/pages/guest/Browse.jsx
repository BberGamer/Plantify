/**
 * Browse.jsx - Trang khám phá và tìm kiếm cây cảnh
 * Hỗ trợ đọc search query và tag từ URL
 */
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { PlantCard } from "@/components/common/PlantCard";
import { useProducts } from "@/features/products/hooks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Search, Filter, Loader2 } from "lucide-react";

const categories = [
  "Tất cả",
  "Dễ chăm sóc",
  "Cây chịu bóng",
  "Sen đá",
  "Trầu bà",
  "Thanh lọc không khí"
];

function Browse() {
  // === URL params: đọc search query và tag từ URL ===
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("q") || "";
  const tag = searchParams.get("tag") || "";

  // State cục bộ cho input search (đồng bộ với URL)
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Khi URL thay đổi (ví dụ: click tag) → sync localSearch
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const { products, total, loading } = useProducts({ search: searchQuery });

  // === Search handlers: Home → Browse dùng ?q=, tag dùng ?tag= ===
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (localSearch.trim()) {
      params.set("q", localSearch.trim());
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    params.delete("tag");
    setSearchParams(params);
  };

  // === Tag handlers: click tag → set URL, clear search ===
  const handleTagClick = (category) => {
    if (category === "Tất cả") {
      setSearchParams({});
    } else {
      setSearchParams({ tag: category, page: "1" });
    }
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-2">
            {searchQuery ? `Kết quả cho "${searchQuery}"` : tag ? `Danh mục: ${tag}` : "Khám phá cây cảnh"}
          </h1>
          <p className="text-xl text-muted-foreground">
            {searchQuery || tag ? "Tìm thấy các loài phù hợp" : "Tìm kiếm và lọc từ hàng nghìn loại cây cảnh"}
          </p>
        </div>
        <div className="mb-10 space-y-6">
          {/* === Search Form: đồng bộ với URL === */}
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, tên khoa học..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>
            <Button type="submit" size="lg" variant="outline" className="gap-2">
              <Search className="w-5 h-5" />
              Tìm kiếm
            </Button>
          </form>
          {/* === Tag navigation === */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={(tag === category || (category === "Tất cả" && !tag)) ? "default" : "secondary"}
                className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-white transition-colors"
                onClick={() => handleTagClick(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Độ khó" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Dễ</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="hard">Khó</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Ánh sáng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Bóng râm</SelectItem>
                <SelectItem value="medium">Ánh sáng gián tiếp</SelectItem>
                <SelectItem value="high">Nhiều ánh sáng</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Tưới nước" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Ít</SelectItem>
                <SelectItem value="medium">Vừa phải</SelectItem>
                <SelectItem value="high">Nhiều</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Phổ biến nhất</SelectItem>
                <SelectItem value="az">A-Z</SelectItem>
                <SelectItem value="za">Z-A</SelectItem>
                <SelectItem value="difficulty">Độ khó</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* === Results header === */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            {loading ? (
              "Đang tìm kiếm..."
            ) : (
              <>
                Hiển thị <span className="font-semibold text-foreground">{total || products.length}</span> kết quả
              </>
            )}
          </p>
          {(searchQuery || tag) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setLocalSearch("");
                setSearchParams({});
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {/* === Products grid === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : products.length > 0 ? (
            products.map((plant) => (
              <Link key={plant._id || plant.scientificName} to={`/plant/${plant.slug || plant.scientificName}`}>
                <PlantCard {...plant} />
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <p className="text-lg text-muted-foreground mb-4">Không tìm thấy cây cảnh nào phù hợp</p>
              <p className="text-sm text-muted-foreground">
                Thử từ khóa khác hoặc xóa bộ lọc để xem tất cả cây cảnh
              </p>
            </div>
          )}
        </div>
        <div className="mt-12 text-center">
          <Button size="lg" variant="outline">
            Tải thêm cây
          </Button>
        </div>
      </div>
    </div>
  );
}

export {
  Browse
};
