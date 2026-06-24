/**
 * PlantListSection.jsx - Section hiển thị danh sách cây cảnh
 */
import { Link } from "react-router";
import { motion } from "motion/react";
import { usePlants } from "@/features/plants/hooks";
import { PlantCard } from "@/components/common/PlantCard";
import { Button } from "@/components/ui/button";

export function PlantListSection() {
  const { plants: apiPlants, loading, error } = usePlants({ page: 1, limit: 6 });

  const difficultyLabel = { low: "Dễ", medium: "Trung bình", high: "Khó" };
  const levelLabel = { low: "Ít", medium: "Trung bình", high: "Nhiều" };

  const plantCards = apiPlants.map((plant) => ({
    id: plant._id || plant.id,
    name: plant.name,
    scientificName: plant.scientificName,
    difficulty: difficultyLabel[plant.difficultyLevel] || plant.difficultyLevel,
    humidity: plant.humidity,
    light: levelLabel[plant.sunlight] || plant.sunlight,
    indoor: plant.isIndoor,
    imageUrl: plant.thumbnail || plant.images?.[0],
  }));

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-4xl font-bold mb-2">Cơ sở tri thức cây cảnh</h2>
          <p className="text-muted-foreground">
            Khám phá hàng nghìn loại cây cảnh với hướng dẫn chi tiết
          </p>
        </div>
        <Button variant="outline" size="lg" asChild>
          <Link to="/browse">Xem tất cả</Link>
        </Button>
      </div>

      {loading && (
        <div className="py-12 text-center text-muted-foreground">
          Đang tải danh sách cây...
        </div>
      )}

      {error && (
        <div className="py-12 text-center text-destructive">
          Không thể tải danh sách cây: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plantCards.map((plant, index) => (
            <motion.div
              key={plant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/plant/${plant.id}`}>
                <PlantCard {...plant} />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
