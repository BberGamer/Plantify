// ManageCareGuides.jsx - Hiển thị trang quản lý hướng dẫn chăm sóc cho Content Manager
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { CareGuideDialog } from "@/features/care-guides/components/CareGuideDialog";
import { CareGuidesTable } from "@/features/care-guides/components/manage-care-guides/CareGuidesTable";
import {
  useCareGuides,
  useCreateCareGuide,
  useDeleteCareGuide,
  useUpdateCareGuide,
} from "@/features/care-guides/hooks";
import { usePlants } from "@/features/plants/hooks";

const PAGE_SIZE = 8;

/** Định dạng ngày cập nhật hướng dẫn chăm sóc. @param {string|Date} value - Ngày từ API. @returns {string} Ngày hiển thị. */
function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

/** Điều phối tìm kiếm, CRUD và dialog hướng dẫn chăm sóc. @returns {JSX.Element} Trang quản lý hướng dẫn chăm sóc. */
function ManageCareGuides() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);
  const [deletingGuide, setDeletingGuide] = useState(null);

  const { careGuides, loading, refetch } = useCareGuides({ limit: 200 });
  const { plants, loading: loadingPlants } = usePlants({ limit: 200 });
  const { create, loading: creating } = useCreateCareGuide();
  const { update, loading: updating } = useUpdateCareGuide();
  const { remove, loading: deleting } = useDeleteCareGuide();

  const plantMap = useMemo(() => {
    const map = new Map();
    plants.forEach((plant) => {
      if (plant._id) map.set(String(plant._id), plant);
    });
    return map;
  }, [plants]);

  const filteredGuides = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return careGuides.filter((guide) => {
      const plant = plantMap.get(String(guide.plantId));
      const plantName = String(plant?.name || "").toLocaleLowerCase("vi");
      return !keyword || plantName.includes(keyword);
    });
  }, [careGuides, plantMap, search]);

  const pageCount = Math.max(Math.ceil(filteredGuides.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, pageCount);
  const visibleGuides = filteredGuides.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openCreateDialog = () => {
    setEditingGuide(null);
    setDialogOpen(true);
  };

  const openEditDialog = (guide) => {
    setEditingGuide(guide);
    setDialogOpen(true);
  };

  /** Tạo hoặc cập nhật hướng dẫn chăm sóc rồi tải lại danh sách. @param {Object} payload - Dữ liệu hướng dẫn. @returns {Promise<void>} */
  const handleSave = async (payload) => {
    try {
      if (editingGuide) {
        await update(editingGuide._id, payload);
        toast.success("Cập nhật hướng dẫn thành công");
      } else {
        await create(payload);
        toast.success("Tạo hướng dẫn thành công");
      }
      setDialogOpen(false);
      setEditingGuide(null);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể lưu hướng dẫn");
    }
  };

  /** Xóa hướng dẫn đang được chọn sau khi xác nhận. @returns {Promise<void>} */
  const handleDelete = async () => {
    if (!deletingGuide) return;
    try {
      await remove(deletingGuide._id);
      toast.success("Xóa hướng dẫn thành công");
      setDeletingGuide(null);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa hướng dẫn");
    }
  };

  return (
    <div className="min-w-0 max-w-full space-y-6 overflow-x-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Quản lý nội dung</span><span>/</span><span className="font-medium text-foreground">Hướng dẫn chăm sóc</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Hướng dẫn chăm sóc</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý hướng dẫn chăm sóc chi tiết cho từng loài cây.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="rounded-full px-5">
          <Plus className="mr-2 h-4 w-4" /> Tạo hướng dẫn mới
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            placeholder="Tìm theo tên cây..."
            className="rounded-full bg-card pl-10"
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Hiển thị <span className="font-medium text-foreground">{filteredGuides.length}</span> hướng dẫn
      </p>

      <CareGuidesTable
        formatDate={formatDate}
        loading={loading}
        loadingPlants={loadingPlants}
        onDelete={setDeletingGuide}
        onEdit={openEditDialog}
        plantMap={plantMap}
        visibleGuides={visibleGuides}
      />

      {!loading && pageCount > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <Button variant="outline" disabled={safePage <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Trước
          </Button>
          <div className="flex gap-1">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === safePage ? "default" : "outline"}
                size="icon"
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </Button>
            ))}
          </div>
          <Button variant="outline" disabled={safePage >= pageCount} onClick={() => setPage((current) => Math.min(current + 1, pageCount))}>
            Sau <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}

      <CareGuideDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        careGuide={editingGuide}
        plants={plants}
        loading={creating || updating}
        onSubmit={handleSave}
      />

      <AlertDialog open={Boolean(deletingGuide)} onOpenChange={(open) => !open && setDeletingGuide(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa hướng dẫn chăm sóc?</AlertDialogTitle>
            <AlertDialogDescription>
              Hướng dẫn của {plantMap.get(String(deletingGuide?.plantId))?.name || "cây này"} sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-white hover:bg-destructive/90">
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { ManageCareGuides };
