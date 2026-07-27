// AffectedPlantsPicker.jsx - Chọn nhiều cây có thể bị ảnh hưởng bởi bệnh
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, Sprout } from "lucide-react";
import { getReferenceId } from "@/features/plant-diseases/plantDiseaseForm.utils";

/**
 * Hiển thị danh sách cây có tìm kiếm và checkbox chọn nhiều.
 */
export function AffectedPlantsPicker({
  open,
  plants,
  linkedPlants,
  selectedPlantIds,
  loading,
  error,
  onToggle,
}) {
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (open) setSearchValue("");
  }, [open]);

  const availablePlants = useMemo(() => {
    const plantMap = new Map();

    [...plants, ...linkedPlants].forEach((plant) => {
      const plantId = getReferenceId(plant);
      if (plantId && typeof plant === "object") {
        plantMap.set(plantId, plant);
      }
    });

    return [...plantMap.values()];
  }, [linkedPlants, plants]);

  const filteredPlants = useMemo(() => {
    const keyword = searchValue.trim().toLocaleLowerCase("vi");
    if (!keyword) return availablePlants;

    return availablePlants.filter((plant) => (
      [plant.name, plant.scientificName, ...(plant.commonNames || [])]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("vi").includes(keyword))
    ));
  }, [availablePlants, searchValue]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Label>Cây có thể bị ảnh hưởng</Label>
          <p className="text-xs text-muted-foreground">
            Có thể để trống nếu bệnh chưa được xác định cho loại cây cụ thể.
          </p>
        </div>
        <Badge variant="outline">
          Đã chọn {selectedPlantIds.length}
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Tìm cây theo tên thường gọi hoặc tên khoa học..."
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border">
        {loading ? (
          <div className="flex min-h-28 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải danh sách cây...
          </div>
        ) : error ? (
          <div className="px-4 py-8 text-center text-sm text-destructive">
            {error}
          </div>
        ) : filteredPlants.length === 0 ? (
          <div className="flex min-h-28 flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground">
            <Sprout className="h-6 w-6" />
            Không tìm thấy cây phù hợp.
          </div>
        ) : (
          <ScrollArea className="h-48">
            <div className="divide-y">
              {filteredPlants.map((plant) => {
                const plantId = getReferenceId(plant);
                const isSelected = selectedPlantIds.includes(plantId);

                return (
                  <div
                    key={plantId}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <Checkbox
                      id={`md-plant-${plantId}`}
                      checked={isSelected}
                      onCheckedChange={() => onToggle(plantId)}
                    />
                    <Label
                      htmlFor={`md-plant-${plantId}`}
                      className="min-w-0 flex-1 cursor-pointer font-normal"
                    >
                      <span className="block truncate font-medium">
                        {plant.name}
                      </span>
                      {plant.scientificName && (
                        <span className="block truncate text-xs italic text-muted-foreground">
                          {plant.scientificName}
                        </span>
                      )}
                    </Label>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
