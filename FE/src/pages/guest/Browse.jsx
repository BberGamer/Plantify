// Browse.jsx - Trang khám phá cây cảnh với real data từ Plants, pagination và search/tag
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { PlantCard } from "@/components/common/PlantCard";
import { usePlants, usePlantTags } from "@/features/plants/hooks";
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

function Browse() {
  // === URL params ===
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("q") || "";
  const tag = searchParams.get("tag") || "";
  const difficulty = searchParams.get("difficulty") || "";
  const sunlight = searchParams.get("sunlight") || "";
  const watering = searchParams.get("watering") || "";

  // State cục bộ cho input search
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const { plants, loading, error, total, pages, currentPage } = usePlants({
    search: searchQuery,
    tag: tag,
    difficulty: difficulty,
    sunlight: sunlight,
    watering: watering,
    page: parseInt(searchParams.get("page")) || 1,
    limit: 9
  });

  const { tags: availableTags } = usePlantTags();

  const difficultyLabel = { low: "Dễ", medium: "Trung bình", high: "Khó" };
  const levelLabel = { low: "Ít", medium: "Trung bình", high: "Nhiều" };
  const tagLabel = {
    "flowering": "Có hoa",
    "succulent": "Sen đá",
    "air-purifying": "Lọc không khí",
    "low-maintenance": "Dễ chăm",
    "easy-care": "Dễ chăm",
    "pet-friendly": "An toàn thú cưng",
    "edible": "Ăn được",
    "climbing": "Leo giò",
    "outdoor": "Ngoài trời",
    "indoor": "Trong nhà",
    "rare": "Hiếm",
    "beginner-friendly": "Cho người mới",
    "perennial": "Lâu năm",
    "annual": "Một năm",
    "fragrant": "Thơm",
    "medicinal": "Làm thuốc",
    "fast-growing": "Phát triển nhanh",
    "drought-tolerant": "Chịu hạn",
    "shade-loving": "Ủ bóng",
    "foliage": "Lá cây",
    "low-water": "Ít nước",
    "philodendron": "Trầu bà",
    "sunlight": "Ánh nắng",
  };

  // Map plant data cho PlantCard
  const plantCards = plants.map((plant) => ({
    id: plant.id || plant._id,
    name: plant.name,
    scientificName: plant.scientificName,
    difficulty: difficultyLabel[plant.difficultyLevel] || plant.difficultyLevel,
    water: levelLabel[plant.watering] || plant.watering,
    light: levelLabel[plant.sunlight] || plant.sunlight,
    indoor: plant.isIndoor,
    imageUrl: plant.thumbnail || plant.images?.[0],
  }));

  // === Update URL params helper ===
  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.set("page", "1");
    setSearchParams(params);
  };

  // === Handlers ===
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ q: localSearch.trim() });
  };

  const handleTagClick = (selectedTag) => {
    updateParams({ tag: selectedTag === tag ? "" : selectedTag });
  };

  const handleFilterChange = (key, value) => {
    updateParams({ [key]: value });
  };

  const hasActiveFilters = searchQuery || tag || difficulty || sunlight || watering;

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-2">
            {searchQuery ? `Kết quả cho "${searchQuery}"` : tag ? `Danh mục: ${tagLabel[tag] || tag}` : "Khám phá cây cảnh"}
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
          {/* === Tag navigation (dynamic từ API) === */}
          <div className="flex flex-wrap gap-2">
            <Badge
              key="all"
              variant={!tag ? "default" : "secondary"}
              className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-white transition-colors"
              onClick={() => handleTagClick("")}
            >
              Tất cả
            </Badge>
            {availableTags.map((t) => (
              <Badge
                key={t}
                variant={tag === t ? "default" : "secondary"}
                className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-white transition-colors"
                onClick={() => handleTagClick(t)}
              >
                {tagLabel[t] || t}
              </Badge>
            ))}
          </div>
          {/* === Dropdown filters === */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={difficulty} onValueChange={(v) => handleFilterChange("difficulty", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Độ khó" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Dễ</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="high">Khó</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sunlight} onValueChange={(v) => handleFilterChange("sunlight", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Ánh sáng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Ít</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="high">Nhiều</SelectItem>
              </SelectContent>
            </Select>
            <Select value={watering} onValueChange={(v) => handleFilterChange("watering", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Tưới nước" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Ít</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="high">Nhiều</SelectItem>
              </SelectContent>
            </Select>
            <Select value={searchParams.get("sort") || ""} onValueChange={(v) => handleFilterChange("sort", v)}>
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
                Hiển thị <span className="font-semibold text-foreground">{total || plants.length}</span> kết quả
              </>
            )}
          </p>
          {(searchQuery || tag || difficulty || sunlight || watering) && (
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
          ) : error ? (
            <div className="col-span-full text-center py-20">
              <p className="text-lg text-red-500 mb-4">Đã xảy ra lỗi: {error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>Thử lại</Button>
            </div>
          ) : plantCards.length > 0 ? (
            plantCards.map((plant) => (
              <Link key={plant.id} to={`/plant/${plant.scientificName}`}>
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
        {/* === Pagination === */}
        {!loading && plants.length > 0 && pages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set("page", String(currentPage - 1));
                setSearchParams(params);
              }}
            >
              Trước
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: pages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="icon"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set("page", String(pageNum));
                    setSearchParams(params);
                  }}
                >
                  {pageNum}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              disabled={currentPage >= pages}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set("page", String(currentPage + 1));
                setSearchParams(params);
              }}
            >
              Sau
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export {
  Browse
};
