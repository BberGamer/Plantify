// ManageDiseases.jsx - Trang quản lý Bệnh cây cho Content Manager
import { useState } from "react";






import {
  usePlantDiseases,
  useCreatePlantDisease,
  useUpdatePlantDisease,
  useDeletePlantDisease,
} from "@/features/plant-diseases/hooks";
import { usePlants } from "@/features/plants/hooks";
import { useProducts } from "@/features/products/hooks";
import { ManageDiseaseDialog } from "@/features/plant-diseases/components/ManageDiseaseDialog";


import { toast } from "sonner";
import { ManageDiseasesHeader } from "@/features/plant-diseases/components/manage-diseases/ManageDiseasesHeader";
import { ManageDiseasesPagination } from "@/features/plant-diseases/components/manage-diseases/ManageDiseasesPagination";
import { ManageDiseasesTable } from "@/features/plant-diseases/components/manage-diseases/ManageDiseasesTable";

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
    <div className="min-w-0 max-w-full space-y-6 overflow-x-hidden">
      <ManageDiseasesHeader
        onCreate={handleOpenCreate}
        onPageReset={() => setPage(1)}
        onSearchChange={setSearch}
        search={search}
        total={total}
      />

      <ManageDiseasesTable
        deleting={deleting}
        diseases={diseases}
        formatDate={formatDate}
        loading={loading}
        onDelete={handleDelete}
        onEdit={handleOpenEdit}
        plants={plants}
      />

      <ManageDiseasesPagination
        loading={loading}
        onPageChange={setPage}
        page={page}
        pages={pages}
      />

      <ManageDiseaseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        disease={editingDisease}
        plants={plants}
        plantsLoading={plantsLoading}
        plantsError={plantsError}
        products={products}
        productsLoading={productsLoading}
        productsError={productsError}
        onSubmit={handleSubmit}
        loading={creating || updating}
      />
    </div>
  );
}
