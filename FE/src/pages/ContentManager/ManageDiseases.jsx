// ManageDiseases.jsx - Trang quản lý Bệnh cây cho Content Manager
import { useState } from "react";
import {
  Search,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Bug,
  Sprout,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  usePlantDiseases,
  useCreatePlantDisease,
  useUpdatePlantDisease,
  useDeletePlantDisease,
} from "@/features/plant-diseases/hooks";
import { usePlants } from "@/features/plants/hooks";
import { useProducts } from "@/features/products/hooks";
import { ManageDiseaseDialog } from "@/features/plant-diseases/components/ManageDiseaseDialog";
import { DiseaseKnowledgeSummary } from "@/features/plant-diseases/components/DiseaseKnowledgeSummary";
import {
  getDiseaseCategoryLabel,
  getReferenceId,
} from "@/features/plant-diseases/plantDiseaseForm.utils";
import { toast } from "sonner";
import { ManageDiseasesContent } from "@/features/plant-diseases/components/manage-diseases/ManageDiseasesContent";

const getTimestampFromId = (hexId) => {
  if (!hexId || hexId.length !== 24) return null;
  return new Date(parseInt(hexId.substring(0, 8), 16) * 1000);
};

const formatDate = (dateStr, id) => {
  const dateObj = dateStr ? new Date(dateStr) : getTimestampFromId(id);
  if (!dateObj || isNaN(dateObj.getTime())) return "-";
  return `${String(dateObj.getDate()).padStart(2, "0")}/${String(
    dateObj.getMonth() + 1
  ).padStart(2, "0")}/${dateObj.getFullYear()}`;
};

/**
 * Hiển thị tối đa hai cây bị ảnh hưởng và tổng số còn lại.
 */
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

export function ManageDiseases() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDisease, setEditingDisease] = useState(null);

  // Hooks
  const { diseases, loading, total, pages, refetch } = usePlantDiseases({
    page,
    limit: 10,
    search,
  });

  const {
    plants,
    loading: plantsLoading,
    error: plantsError,
  } = usePlants({ limit: 100 });
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts({ limit: 100 });
  const { create, loading: creating } = useCreatePlantDisease();
  const { update, loading: updating } = useUpdatePlantDisease();
  const { remove, loading: deleting } = useDeletePlantDisease();

  const handleOpenCreate = () => {
    setEditingDisease(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (disease) => {
    setEditingDisease(disease);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (payload) => {
    try {
      if (editingDisease) {
        await update(editingDisease._id || editingDisease.id, payload);
        toast.success("Cập nhật bệnh cây thành công");
      } else {
        await create(payload);
        toast.success("Tạo bệnh cây thành công");
      }
      setIsDialogOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã xảy ra lỗi");
    }
  };

  const handleDelete = async (disease) => {
    if (!confirm(`Xóa bệnh cây "${disease.name}"?`)) return;
    try {
      await remove(disease._id || disease.id);
      toast.success("Xóa bệnh cây thành công");
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã xảy ra lỗi");
    }
  };

  return (
    <ManageDiseasesContent AffectedPlantsBadges={AffectedPlantsBadges} creating={creating} deleting={deleting} diseases={diseases} editingDisease={editingDisease} formatDate={formatDate} handleDelete={handleDelete} handleOpenCreate={handleOpenCreate} handleOpenEdit={handleOpenEdit} handleSubmit={handleSubmit} isDialogOpen={isDialogOpen} loading={loading} page={page} pages={pages} plants={plants} plantsError={plantsError} plantsLoading={plantsLoading} products={products} productsError={productsError} productsLoading={productsLoading} search={search} setIsDialogOpen={setIsDialogOpen} setPage={setPage} setSearch={setSearch} total={total} updating={updating} />
  );
}
