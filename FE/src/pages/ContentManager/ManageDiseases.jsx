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
    <div className="min-w-0 max-w-full space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Quản lý nội dung</span>
            <span>/</span>
            <span className="font-medium text-foreground">Bệnh cây</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Bệnh cây</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý thông tin bệnh hại và cách phòng trị hiệu quả
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="rounded-full px-5">
          <Plus className="mr-2 h-4 w-4" /> Thêm bệnh mới
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Tìm tên bệnh, canonical key, alias, triệu chứng hoặc cây..."
            className="rounded-full bg-card pl-10"
          />
        </div>
      </div>

      {/* List count */}
      <p className="text-sm text-muted-foreground">
        Hiển thị <span className="font-medium text-foreground">{total}</span> loại bệnh
      </p>

      {/* Diseases table */}
      <Card className="min-w-0 max-w-full overflow-hidden border-border/70 shadow-sm transition-all duration-300 hover:shadow-md">
        {loading ? (
          <div className="flex min-h-72 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : diseases.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bug className="h-6 w-6" />
            </div>
            <h2 className="font-semibold">Chưa có thông tin bệnh nào</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Thử tìm kiếm khác hoặc tạo bệnh mới đầu tiên.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-hidden">
            <Table className="w-full table-fixed">
              <TableHeader className="bg-primary/5">
                <TableRow>
                  <TableHead className="w-[30%] md:w-[20%] px-5 text-xs uppercase text-primary">Tên bệnh</TableHead>
                  <TableHead className="w-[30%] md:w-[20%] text-xs uppercase text-primary">Cây bị ảnh hưởng</TableHead>
                  <TableHead className="hidden md:table-cell w-[40%] text-xs uppercase text-primary">Kiến thức bệnh</TableHead>
                  <TableHead className="w-[25%] md:w-[12%] text-xs uppercase text-primary">Cập nhật</TableHead>
                  <TableHead className="w-[15%] md:w-[8%] px-5 text-right text-xs uppercase text-primary">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diseases.map((disease) => (
                  <TableRow key={disease._id || disease.id} className="transition-colors hover:bg-muted/30">
                    <TableCell className="overflow-hidden px-5 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative shrink-0">
                          {Array.isArray(disease.images) && disease.images.length > 0 ? (
                            <>
                              <img
                                src={disease.images[0]}
                                alt={disease.name}
                                className="h-10 w-10 rounded-lg object-cover border border-border/60 shadow-sm"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23999' font-size='10'%3EErr%3C/text%3E%3C/svg%3E";
                                }}
                              />
                              {disease.images.length > 1 && (
                                <span className="absolute -bottom-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-black/60 px-1 text-[9px] font-bold text-white leading-none">
                                  +{disease.images.length - 1}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-500 border border-red-100">
                              <Bug className="h-5 w-5" />
                            </span>
                          )}
                        </div>
                        <span className="min-w-0 space-y-1 overflow-hidden">
                          <span className="block truncate font-medium text-foreground">
                            {disease.name}
                          </span>
                          <span className="flex min-w-0 flex-wrap items-center gap-1">
                            <code
                              className="max-w-full truncate rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                              title={disease.diseaseKey}
                            >
                              {disease.diseaseKey || "chưa-có-key"}
                            </code>
                            <Badge
                              variant={disease.isActive === false ? "secondary" : "outline"}
                              className="px-1.5 py-0 text-[9px]"
                            >
                              {disease.isActive === false ? "Tạm ẩn" : "Đang dùng"}
                            </Badge>
                          </span>
                          <span
                            className="block truncate text-[10px] text-muted-foreground"
                            title={getDiseaseCategoryLabel(disease.category)}
                          >
                            {getDiseaseCategoryLabel(disease.category)}
                          </span>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="overflow-hidden py-4 text-sm leading-5">
                      <AffectedPlantsBadges disease={disease} plants={plants} />
                    </TableCell>
                    <TableCell className="hidden overflow-hidden whitespace-normal py-3 md:table-cell">
                      <DiseaseKnowledgeSummary disease={disease} />
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {formatDate(disease.updatedAt || disease.createdAt, disease._id || disease.id)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(disease)}
                          title="Chỉnh sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(disease)}
                          title="Xóa"
                          disabled={deleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {!loading && pages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Trước
          </Button>
          <div className="flex gap-1">
            {Array.from({ length: pages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                size="icon"
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            disabled={page >= pages}
            onClick={() => setPage((current) => Math.min(current + 1, pages))}
          >
            Sau <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Dialog */}
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
