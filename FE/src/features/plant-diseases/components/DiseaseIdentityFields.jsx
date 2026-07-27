// DiseaseIdentityFields.jsx - Nhóm field nhận diện canonical cho bệnh cây
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DISEASE_CATEGORY_OPTIONS,
  normalizeDiseaseKey,
} from "@/features/plant-diseases/plantDiseaseForm.utils";
import { AffectedPlantsPicker } from "./AffectedPlantsPicker";

/**
 * Hiển thị tên, canonical key, cây, category và aliases.
 */
export function DiseaseIdentityFields({
  open,
  form,
  plants,
  linkedPlants,
  plantsLoading,
  plantsError,
  onNameChange,
  onFieldChange,
  onTogglePlant,
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Nhận diện bệnh</h3>
        <p className="text-xs text-muted-foreground">
          Canonical key là mã ổn định để backend tra cứu, không dùng tên AI trả về trực tiếp.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="md-name">Tên hiển thị *</Label>
          <Input
            id="md-name"
            value={form.name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="VD: Bệnh đốm lá nâu"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="md-disease-key">Canonical key *</Label>
          <Input
            id="md-disease-key"
            value={form.diseaseKey}
            onChange={(event) => onFieldChange("diseaseKey", event.target.value)}
            onBlur={() => onFieldChange(
              "diseaseKey",
              normalizeDiseaseKey(form.diseaseKey || form.name)
            )}
            placeholder="VD: leaf-spot"
            required
          />
          <p className="text-xs text-muted-foreground">
            Chỉ gồm chữ thường, số và dấu gạch ngang.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-1">
          <Label htmlFor="md-category">Nhóm vấn đề *</Label>
          <Select
            value={form.category}
            onValueChange={(value) => onFieldChange("category", value)}
            required
          >
            <SelectTrigger id="md-category">
              <SelectValue placeholder="Chọn nhóm vấn đề" />
            </SelectTrigger>
            <SelectContent>
              {DISEASE_CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="md-aliases">Tên đồng nghĩa Việt / Anh</Label>
        <Textarea
          id="md-aliases"
          value={form.aliases}
          onChange={(event) => onFieldChange("aliases", event.target.value)}
          placeholder={"Leaf spot\nBệnh đốm lá\nBrown leaf spot"}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Nhập mỗi tên đồng nghĩa trên một dòng.
        </p>
      </div>

      <AffectedPlantsPicker
        open={open}
        plants={plants}
        linkedPlants={linkedPlants}
        selectedPlantIds={form.affectedPlantIds}
        loading={plantsLoading}
        error={plantsError}
        onToggle={onTogglePlant}
      />
    </section>
  );
}
