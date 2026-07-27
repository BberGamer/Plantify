// PlantDetailList.jsx - Component hiển thị danh sách Care Guides và Diseases
import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Droplets, Leaf, AlertCircle, Scissors, Sprout, RefreshCw, Bug } from "lucide-react";
import { DiseaseListContent } from "@/features/plants/components/plant-detail-list/DiseaseListContent";
import { CareGuideListContent } from "@/features/plants/components/plant-detail-list/CareGuideListContent";

const formatKnowledgeList = (value) => (
  Array.isArray(value) ? value.join(", ") : value
);

/**
 * CareGuideList - Danh sách Care Guides
 */
export function CareGuideList({ careGuides, loading }) {
  return (
    <CareGuideListContent careGuides={careGuides} loading={loading} />
  );
}

/**
 * DiseaseList - Danh sách Bệnh cây
 */
export function DiseaseList({ diseases, loading }) {
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedDiseaseName, setSelectedDiseaseName] = useState("");

  const openImagePreview = (imageUrl, diseaseName) => {
    setSelectedImage(imageUrl);
    setSelectedDiseaseName(diseaseName);
  };

  return (
    <DiseaseListContent diseases={diseases} formatKnowledgeList={formatKnowledgeList} loading={loading} openImagePreview={openImagePreview} selectedDiseaseName={selectedDiseaseName} selectedImage={selectedImage} setSelectedImage={setSelectedImage} />
  );
}
