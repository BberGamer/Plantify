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
import { ManageDiseaseDialogView } from "@/features/plant-diseases/components/manage-disease-dialog/ManageDiseaseDialogView";

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
    <ManageDiseaseDialogView disease={disease} form={form} handleFieldChange={handleFieldChange} handleNameChange={handleNameChange} handleSubmit={handleSubmit} linkedPlants={linkedPlants} linkedProducts={linkedProducts} loading={loading} onOpenChange={onOpenChange} open={open} plants={plants} plantsError={plantsError} plantsLoading={plantsLoading} products={products} productsError={productsError} productsLoading={productsLoading} toggleAffectedPlant={toggleAffectedPlant} toggleRecommendedProduct={toggleRecommendedProduct} />
  );
}
