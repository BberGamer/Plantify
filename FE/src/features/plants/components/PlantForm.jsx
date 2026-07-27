// PlantForm.jsx - Form tạo/cập nhật Plant
import { useState } from "react";
import { Loader2, Plus, X, GripVertical, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

const EMPTY_FORM = {
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
  tags: "",
  soil: "",
  toxicity: false,
};

import { ImageUploader } from "@/components/common/ImageUploader";
import { PlantFormDialog } from "@/features/plants/components/plant-form/PlantFormDialog";

const toCommaArray = (str) =>
  str ? str.split(",").map((t) => t.trim()).filter(Boolean) : [];

/**
 * PlantForm - Form tạo Plant mới
 */
export function PlantForm({ categories, onSubmit, loading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const handleOpen = () => {
    setFormData(EMPTY_FORM);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormData(EMPTY_FORM);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      images: formData.images,
      tags: toCommaArray(formData.tags),
      temperatureMin: formData.temperatureMin !== "" ? Number(formData.temperatureMin) : undefined,
      temperatureMax: formData.temperatureMax !== "" ? Number(formData.temperatureMax) : undefined,
    };
    await onSubmit(payload);
    handleClose();
  };

  return (
    <PlantFormDialog categories={categories} formData={formData} handleChange={handleChange} handleClose={handleClose} handleOpen={handleOpen} handleSubmit={handleSubmit} isOpen={isOpen} loading={loading} setIsOpen={setIsOpen} />
  );
}
