import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets, Sun, Home, Heart } from "lucide-react";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { useFavorite } from "@/features/favorites/hooks";

function PlantCard({
  id,
  name,
  scientificName,
  difficulty,
  water,
  light,
  indoor,
  imageUrl
}) {
  const { isFavorited, loading, toggle } = useFavorite(id);

  const difficultyColor = {
    Dễ: "bg-green-100 text-green-700 border-green-200",
    "Trung bình": "bg-yellow-100 text-yellow-700 border-yellow-200",
    Khó: "bg-red-100 text-red-700 border-red-200"
  };

  return (
    <Card className="group overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-card">
      <div className="aspect-[4/3] overflow-hidden relative">
        <ImageWithFallback
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <Badge className={difficultyColor[difficulty] + " backdrop-blur-sm"}>
            {difficulty}
          </Badge>
        </div>
      </div>
      <CardContent className="p-5">
        <h3 className="mb-1">{name}</h3>
        <p className="text-sm text-muted-foreground mb-4 italic">
          {scientificName}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-primary" />
              <span>{water}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-primary" />
              <span>{light}</span>
            </div>
            {indoor && (
              <div className="flex items-center gap-1.5">
                <Home className="w-4 h-4 text-primary" />
              </div>
            )}
          </div>
          {/* Nút yêu thích */}
          {id && (
            <button
              type="button"
              onClick={toggle}
              disabled={loading}
              aria-label={isFavorited ? "Bỏ yêu thích" : "Yêu thích"}
              className="ml-2 flex-shrink-0 p-1.5 rounded-full transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50"
            >
              <Heart
                className={`w-5 h-5 transition-colors duration-200 ${
                  isFavorited
                    ? "fill-red-500 text-red-500"
                    : "fill-white text-gray-400 stroke-[1.5]"
                }`}
              />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export { PlantCard };
