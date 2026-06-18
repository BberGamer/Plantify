// PlantCard.jsx - Card hiển thị thông tin Plant trong grid
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, ImageIcon } from "lucide-react";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";

const DIFFICULTY_COLORS = {
  "Dễ": "bg-green-100 text-green-700 border-green-200",
  "Trung bình": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Khó": "bg-red-100 text-red-700 border-red-200",
};

/**
 * PlantCard - Card hiển thị 1 Plant
 */
export function PlantCard({ plant, onDelete }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/content/plants/${plant._id || plant.id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(plant);
  };

  return (
    <Card
      className="group overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-card"
      onClick={handleCardClick}
    >
      <div className="aspect-[4/3] overflow-hidden relative">
        <ImageWithFallback
          src={plant.images?.[0]}
          alt={plant.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          fallback={<ImageIcon className="w-12 h-12 text-muted-foreground" />}
        />
        <div className="absolute top-3 left-3">
          <Badge className={DIFFICULTY_COLORS[plant.difficultyLevel] + " backdrop-blur-sm"}>
            {plant.difficultyLevel || "—"}
          </Badge>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Eye className="w-8 h-8 text-white" />
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-1 truncate">{plant.name}</h3>
        <p className="text-xs text-muted-foreground italic mb-3 truncate">
          {plant.scientificName || ""}
        </p>
        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
