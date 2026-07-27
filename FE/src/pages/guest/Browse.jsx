// Browse.jsx - Hiển thị trang khám phá cây với tìm kiếm, bộ lọc và phân trang
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";

import { usePlants, usePlantTags } from "@/features/plants/hooks";




import { BrowseFilters } from "@/features/plants/components/browse/BrowseFilters";
import { BrowseResults } from "@/features/plants/components/browse/BrowseResults";

function Browse() {
  // === URL params ===
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("q") || "";
  const tag = searchParams.get("tag") || "";

  // State cục bộ cho input search
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Live search: debounce localSearch -> URL param q (400ms)
  useEffect(() => {
    if (localSearch === searchQuery) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (localSearch.trim()) {
        params.set("q", localSearch.trim());
      } else {
        params.delete("q");
      }
      params.set("page", "1");
      setSearchParams(params);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  const { plants, loading, error, total, pages, currentPage } = usePlants({
    search: searchQuery,
    tag: tag,
    page: parseInt(searchParams.get("page")) || 1,
    limit: 9
  });

  const { tags: availableTags } = usePlantTags();

  const TAG_VISIBLE_LIMIT = 15;
  const [showAllTags, setShowAllTags] = useState(false);
  const visibleTags = showAllTags
    ? availableTags
    : availableTags.slice(0, TAG_VISIBLE_LIMIT);
  const remainingTagsCount = Math.max(availableTags.length - TAG_VISIBLE_LIMIT, 0);

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
    id: plant._id || plant.id,
    name: plant.name,
    scientificName: plant.scientificName,
    difficulty: difficultyLabel[plant.difficultyLevel] || plant.difficultyLevel,
    humidity: plant.humidity,
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

  const hasActiveFilters = searchQuery || tag;

  const handlePageChange = (nextPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <h1 className="mb-2 text-5xl font-bold">
            {searchQuery
              ? `Kết quả cho "${searchQuery}"`
              : tag
                ? `Danh mục: ${tagLabel[tag] || tag}`
                : "Khám phá cây cảnh"}
          </h1>
          <p className="text-xl text-muted-foreground">
            {searchQuery || tag
              ? "Tìm thấy các loài phù hợp"
              : "Tìm kiếm và lọc từ hàng nghìn loại cây cảnh"}
          </p>
        </div>

        <BrowseFilters
          availableTags={availableTags}
          localSearch={localSearch}
          onSearchChange={setLocalSearch}
          onSearchSubmit={handleSearchSubmit}
          onTagClick={handleTagClick}
          onToggleTags={() => setShowAllTags((current) => !current)}
          remainingTagsCount={remainingTagsCount}
          showAllTags={showAllTags}
          tag={tag}
          tagLabel={tagLabel}
          visibleTags={visibleTags}
        />

        <BrowseResults
          currentPage={currentPage}
          error={error}
          hasActiveFilters={hasActiveFilters}
          loading={loading}
          onClearFilters={() => {
            setLocalSearch("");
            setSearchParams({});
          }}
          onPageChange={handlePageChange}
          pages={pages}
          plantCards={plantCards}
          plantsCount={plants.length}
          total={total}
        />
      </div>
    </div>
  );
}

export {
  Browse
};
