// PlantEditForm.jsx - Form chỉnh sửa Plant + Modal thêm Care Guide + Modal thêm Disease
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";








// Constants
const EMPTY_PLANT_FORM = {
  name: "",
  scientificName: "",
  categoryId: "",
  images: [],
  shortDescription: "",
  description: "",
  difficultyLevel: "",
  sunlight: "",
  humidity: "",
  temperatureMin: "",
  temperatureMax: "",
  origin: "",
  soil: "",
  toxicity: false,
  tags: "",
};

const toCommaString = (arr) => (Array.isArray(arr) && arr.length > 0 ? arr.join(", ") : "");
const toCommaArray = (str) => (str ? str.split(",").map((t) => t.trim()).filter(Boolean) : []);


import { textareaToList } from "@/features/plant-diseases/plantDiseaseForm.utils";
import { DiseaseFields } from "@/features/plants/components/plant-edit-form/DiseaseFields";
import { PlantEditFields } from "@/features/plants/components/plant-edit-form/PlantEditFields";
import { CareGuideFields } from "@/features/plants/components/plant-edit-form/CareGuideFields";

// ===================== PLANT EDIT FORM =====================

/**
 * PlantEditForm - Form chỉnh sửa Plant
 */
export function PlantEditForm({ plant, categories, onUpdate, loading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_PLANT_FORM);

  useEffect(() => {
    if (plant && isOpen) {
      setForm({
        name: plant.name || "",
        scientificName: plant.scientificName || "",
        categoryId: plant.categoryId || "",
        images: Array.isArray(plant.images) ? [...plant.images] : [],
        shortDescription: plant.shortDescription || "",
        description: plant.description || "",
        difficultyLevel: plant.difficultyLevel || "",
        sunlight: plant.sunlight || "",
        humidity: plant.humidity || "",
        temperatureMin: plant.temperatureMin ?? "",
        temperatureMax: plant.temperatureMax ?? "",
        origin: plant.origin || "",
        soil: plant.soil || "",
        toxicity: plant.toxicity ?? false,
        tags: Array.isArray(plant.tags) ? plant.tags.join(", ") : "",
      });
    }
  }, [plant, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      tags: toCommaArray(form.tags),
      temperatureMin: form.temperatureMin !== "" ? Number(form.temperatureMin) : undefined,
      temperatureMax: form.temperatureMax !== "" ? Number(form.temperatureMax) : undefined,
    };
    await onUpdate(payload);
    setIsOpen(false);
  };

  return (
      <PlantEditFields
        categories={categories}
        form={form}
        handleSubmit={handleSubmit}
        isOpen={isOpen}
        loading={loading}
        setForm={setForm}
        setIsOpen={setIsOpen}
      />
  );
}

// ===================== CARE GUIDE FORM =====================

const CareGuideFormInner = forwardRef(({ plantId, plantName, onCreate, loading }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    watering: "",
    propagation: "",
    pruning: "",
    repotting: "",
  });

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onCreate({ ...form, plantId });
    setIsOpen(false);
    setForm({ watering: "", propagation: "", pruning: "", repotting: "" });
  };

  return (
    <CareGuideFields form={form} handleSubmit={handleSubmit} isOpen={isOpen} loading={loading} plantName={plantName} setForm={setForm} setIsOpen={setIsOpen} />
  );
});

CareGuideFormInner.displayName = "CareGuideFormInner";

export const CareGuideForm = CareGuideFormInner;

// ===================== DISEASE FORM =====================

const DiseaseFormInner = forwardRef(({ plantId, plantName, onCreate, loading }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    symptoms: "",
    causes: "",
    treatment: "",
    prevention: "",
    images: [],
  });

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onCreate({
      name: form.name.trim(),
      symptoms: textareaToList(form.symptoms),
      causes: textareaToList(form.causes),
      treatments: textareaToList(form.treatment),
      preventions: textareaToList(form.prevention),
      affectedPlantIds: [plantId],
      images: form.images,
    });
    setIsOpen(false);
    setForm({ name: "", symptoms: "", causes: "", treatment: "", prevention: "", images: [] });
  };

  return (
    <DiseaseFields form={form} handleSubmit={handleSubmit} isOpen={isOpen} loading={loading} plantName={plantName} setForm={setForm} setIsOpen={setIsOpen} />
  );
});

DiseaseFormInner.displayName = "DiseaseFormInner";

export const DiseaseForm = DiseaseFormInner;
