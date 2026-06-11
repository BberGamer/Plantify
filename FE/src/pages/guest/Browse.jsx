import { useState, useEffect } from "react";
import { Link } from "react-router";
import { PlantCard } from "@/components/common/PlantCard";
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
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { usePlants } from "@/features/plants/hooks";
import { getPlantCategories } from "@/features/plants/api";

function Browse() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParam, setSearchParam] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [categories, setCategories] = useState(["Tất cả"]);

  // Dropdown states
  const [difficulty, setDifficulty] = useState("");
  const [sunlight, setSunlight] = useState("");
  const [watering, setWatering] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  // Pagination state
  const [page, setPage] = useState(1);

  useEffect(() => {
    getPlantCategories()
      .then((res) => {
        if (res.success && res.data) {
          const names = ["Tất cả", ...res.data.map((c) => c.name)];
          setCategories(names);
        }
      })
      .catch((err) => console.error("Lỗi lấy danh mục cây:", err));
  }, []);

  // Fetch plants from the backend API
  const { plants, loading, error, hasMore } = usePlants({
    search: searchParam,
    category: selectedCategory,
    difficulty: difficulty || undefined,
    sunlight: sunlight || undefined,
    watering: watering || undefined,
    sortBy: sortBy || undefined,
    page,
    limit: 6
  });

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setSearchParam(searchQuery);
    setPage(1);
  };

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSearchParam("");
    setSelectedCategory("Tất cả");
    setDifficulty("");
    setSunlight("");
    setWatering("");
    setSortBy("popular");
    setPage(1);
  };

  const mapPlantForCard = (plant) => {
    const diffMap = { low: "Dễ", medium: "Trung bình", high: "Khó" };
    const waterMap = { low: "Ít", medium: "Vừa phải", high: "Nhiều" };
    const lightMap = { low: "Bóng râm", medium: "Ánh sáng gián tiếp", high: "Nhiều ánh sáng" };

    return {
      name: plant.name,
      scientificName: plant.scientificName,
      difficulty: diffMap[plant.difficultyLevel] || "Dễ",
      water: waterMap[plant.watering] || "Vừa phải",
      light: lightMap[plant.sunlight] || "Ánh sáng gián tiếp",
      indoor: plant.isIndoor ?? true,
      imageUrl: plant.thumbnail || (plant.images && plant.images[0]) || "https://images.unsplash.com/photo-1614887410788-e158d6efb3be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
    };
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-2">Khám phá cây cảnh</h1>
          <p className="text-xl text-muted-foreground">
            Tìm kiếm và lọc từ hàng nghìn loại cây cảnh
          </p>
        </div>
        
        <div className="mb-10 space-y-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, tên khoa học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg text-black"
              />
            </div>
            <Button type="submit" size="lg" className="bg-primary text-white hover:bg-primary/95">
              Tìm kiếm
            </Button>
          </form>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "secondary"}
                className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-white transition-colors"
                onClick={() => {
                  setSelectedCategory(category);
                  setPage(1);
                }}
              >
                {category}
              </Badge>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={difficulty || "all"} onValueChange={(val) => { setDifficulty(val === "all" ? "" : val); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Độ khó" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả độ khó</SelectItem>
                <SelectItem value="easy">Dễ</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="hard">Khó</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sunlight || "all"} onValueChange={(val) => { setSunlight(val === "all" ? "" : val); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Ánh sáng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả mức sáng</SelectItem>
                <SelectItem value="low">Bóng râm</SelectItem>
                <SelectItem value="medium">Ánh sáng gián tiếp</SelectItem>
                <SelectItem value="high">Nhiều ánh sáng</SelectItem>
              </SelectContent>
            </Select>
            <Select value={watering || "all"} onValueChange={(val) => { setWatering(val === "all" ? "" : val); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Tưới nước" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả mức nước</SelectItem>
                <SelectItem value="low">Ít</SelectItem>
                <SelectItem value="medium">Vừa phải</SelectItem>
                <SelectItem value="high">Nhiều</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy || "popular"} onValueChange={(val) => { setSortBy(val); setPage(1); }}>
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

        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            Hiển thị <span className="font-semibold text-foreground">{plants.length}</span> kết quả
          </p>
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <Filter className="w-4 h-4 mr-2" />
            Xóa bộ lọc
          </Button>
        </div>

        {loading && page === 1 ? (
          <div className="flex justify-center items-center py-20 w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 font-semibold">{error}</p>
          </div>
        ) : plants.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Không tìm thấy cây nào phù hợp.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plants.map((plant) => (
              <Link key={plant.scientificName || plant._id} to={`/plant/${plant.scientificName || plant._id}`}>
                <PlantCard {...mapPlantForCard(plant)} />
              </Link>
            ))}
          </div>
        )}

        {hasMore && plants.length > 0 && (
          <div className="mt-12 text-center">
            <Button size="lg" variant="outline" onClick={handleLoadMore} disabled={loading}>
              {loading ? "Đang tải..." : "Tải thêm cây"}
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
