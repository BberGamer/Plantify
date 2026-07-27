// ManageDiseaseDialog.jsx - Dialog quản lý đầy đủ kho tri thức bệnh cây
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { ImageUploader } from "@/components/common/ImageUploader";
import { DiseaseIdentityFields } from "./DiseaseIdentityFields";
import { DiseaseKnowledgeFields } from "./DiseaseKnowledgeFields";
import { RecommendedProductsPicker } from "./RecommendedProductsPicker";
import {
  DISEASE_CATEGORY_OPTIONS,
  getReferenceId,
  listToTextarea,
  normalizeDiseaseKey,
  textareaToList,
} from "@/features/plant-diseases/plantDiseaseForm.utils";

const EMPTY_FORM = {
  name: "",
  diseaseKey: "",
  aliases: "",
  category: "disease",
  affectedPlantIds: [],
  symptoms: "",
  causes: "",
  treatment: "",
  prevention: "",
  recommendedProducts: [],
  images: [],
  isActive: true,
};

/**
 * Dialog cho phép Content Manager tạo và chỉnh sửa toàn bộ PlantDisease.
 */
export function ManageDiseaseDialog({
  open,
  onOpenChange,
  disease,
  plants = [],
  plantsLoading = false,
  plantsError = "",
  products = [],
  productsLoading = false,
  productsError = "",
  onSubmit,
  loading,
}) {
  const [form, setForm] = useState({
    ...EMPTY_FORM,
  });

  useEffect(() => {
    if (disease) {
      setForm({
        name: disease.name || "",
        diseaseKey: disease.diseaseKey || normalizeDiseaseKey(disease.name),
        aliases: listToTextarea(disease.aliases),
        category: DISEASE_CATEGORY_OPTIONS.some(
          (option) => option.value === disease.category
        )
          ? disease.category
          : "",
        affectedPlantIds: Array.isArray(disease.affectedPlantIds)
          ? disease.affectedPlantIds.map(getReferenceId).filter(Boolean)
          : disease.plantId
            ? [getReferenceId(disease.plantId)]
            : [],
        symptoms: listToTextarea(disease.symptoms),
        causes: listToTextarea(disease.causes),
        treatment: listToTextarea(disease.treatments ?? disease.treatment),
        prevention: listToTextarea(disease.preventions ?? disease.prevention),
        recommendedProducts: Array.isArray(disease.recommendedProducts)
          ? disease.recommendedProducts.map(getReferenceId).filter(Boolean)
          : [],
        images: Array.isArray(disease.images) ? disease.images : [],
        isActive: disease.isActive !== false,
      });
      return;
    }

    setForm({
      ...EMPTY_FORM,
    });
  }, [disease, open]);

  /**
   * Đồng bộ diseaseKey theo tên khi đang tạo mới và key chưa bị sửa thủ công.
   */
  const handleNameChange = (name) => {
    setForm((previousForm) => {
      const previousAutoKey = normalizeDiseaseKey(previousForm.name);
      const shouldSyncKey = !previousForm.diseaseKey
        || (!disease && previousForm.diseaseKey === previousAutoKey);

      return {
        ...previousForm,
        name,
        diseaseKey: shouldSyncKey
          ? normalizeDiseaseKey(name)
          : previousForm.diseaseKey,
      };
    });
  };

  const handleFieldChange = (field, value) => {
    setForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));
  };

  const toggleRecommendedProduct = (productId) => {
    setForm((previousForm) => ({
      ...previousForm,
      recommendedProducts: previousForm.recommendedProducts.includes(productId)
        ? previousForm.recommendedProducts.filter((id) => id !== productId)
        : [...previousForm.recommendedProducts, productId],
    }));
  };

  const toggleAffectedPlant = (plantId) => {
    setForm((previousForm) => ({
      ...previousForm,
      affectedPlantIds: previousForm.affectedPlantIds.includes(plantId)
        ? previousForm.affectedPlantIds.filter((id) => id !== plantId)
        : [...previousForm.affectedPlantIds, plantId],
    }));
  };

  /**
   * Chuyển các textarea thành mảng trước khi gửi API.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSubmit({
      name: form.name.trim(),
      diseaseKey: normalizeDiseaseKey(form.diseaseKey || form.name),
      aliases: textareaToList(form.aliases),
      category: form.category,
      affectedPlantIds: form.affectedPlantIds,
      symptoms: textareaToList(form.symptoms),
      causes: textareaToList(form.causes),
      treatments: textareaToList(form.treatment),
      preventions: textareaToList(form.prevention),
      recommendedProducts: form.recommendedProducts,
      images: form.images,
      isActive: form.isActive,
    });
  };

  const linkedProducts = Array.isArray(disease?.recommendedProducts)
    ? disease.recommendedProducts
    : [];
  const linkedPlants = Array.isArray(disease?.affectedPlantIds)
    ? disease.affectedPlantIds
    : disease?.plantId
      ? [disease.plantId]
      : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {disease ? "Chỉnh sửa bệnh cây" : "Thêm bệnh cây mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <DiseaseIdentityFields
            open={open}
            form={form}
            plants={plants}
            linkedPlants={linkedPlants}
            plantsLoading={plantsLoading}
            plantsError={plantsError}
            onNameChange={handleNameChange}
            onFieldChange={handleFieldChange}
            onTogglePlant={toggleAffectedPlant}
          />

          <DiseaseKnowledgeFields
            form={form}
            onFieldChange={handleFieldChange}
          />

          <RecommendedProductsPicker
            open={open}
            products={products}
            linkedProducts={linkedProducts}
            selectedProductIds={form.recommendedProducts}
            loading={productsLoading}
            error={productsError}
            onToggle={toggleRecommendedProduct}
          />

          <section className="space-y-4 border-t pt-5">
            <div className="space-y-2">
              <Label>Hình ảnh bệnh cây</Label>
              <ImageUploader
                images={form.images}
                onChange={(images) => handleFieldChange("images", images)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3">
              <div>
                <Label htmlFor="md-is-active">Cho phép sử dụng trong chẩn đoán</Label>
                <p className="text-xs text-muted-foreground">
                  Tắt để giữ dữ liệu nhưng không cho pipeline AI sử dụng.
                </p>
              </div>
              <Switch
                id="md-is-active"
                checked={form.isActive}
                onCheckedChange={(checked) => handleFieldChange("isActive", checked)}
              />
            </div>
          </section>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {disease ? "Lưu thay đổi" : "Tạo bệnh mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
