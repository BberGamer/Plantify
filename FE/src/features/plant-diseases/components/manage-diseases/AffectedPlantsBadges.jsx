import { Badge } from "@/components/ui/badge";
import { Sprout } from "lucide-react";
import { getReferenceId } from "@/features/plant-diseases/plantDiseaseForm.utils";

function AffectedPlantsBadges({ disease, plants }) {
  const affectedPlants = Array.isArray(disease.affectedPlantIds)
    ? disease.affectedPlantIds
    : disease.plantId
      ? [disease.plantId]
      : [];

  if (affectedPlants.length === 0) {
    return <span className="text-xs text-muted-foreground">Chưa xác định</span>;
  }

  return (
    <div className="flex max-w-full flex-wrap gap-1">
      {affectedPlants.slice(0, 2).map((affectedPlant) => {
        const plantId = getReferenceId(affectedPlant);
        const plantName = affectedPlant?.name
          || plants.find((plant) => getReferenceId(plant) === plantId)?.name
          || "Cây liên quan";

        return (
          <Badge
            key={plantId}
            variant="outline"
            className="max-w-full gap-1 rounded-full border-green-200/50 bg-green-50/50 px-2 py-0.5 text-[11px] font-normal text-green-700"
            title={plantName}
          >
            <Sprout className="h-3 w-3 shrink-0" />
            <span className="truncate">{plantName}</span>
          </Badge>
        );
      })}
      {affectedPlants.length > 2 && (
        <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[10px]">
          +{affectedPlants.length - 2}
        </Badge>
      )}
    </div>
  );
}

export { AffectedPlantsBadges };
