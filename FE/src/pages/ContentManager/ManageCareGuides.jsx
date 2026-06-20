import { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Search,
  Sprout,
  Trash2,
} from "lucide-react";
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
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CareGuideDialog } from "@/features/care-guides/components/CareGuideDialog";
import {
  useCareGuides,
  useCreateCareGuide,
  useDeleteCareGuide,
  useUpdateCareGuide,
} from "@/features/care-guides/hooks";
import { usePlants } from "@/features/plants/hooks";

const PAGE_SIZE = 8;

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

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

      <Card className="min-w-0 max-w-full overflow-hidden border-border/70 shadow-sm">
        {loading || loadingPlants ? (
          <div className="flex min-h-72 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : visibleGuides.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <h2 className="font-semibold">Chưa có hướng dẫn phù hợp</h2>
            <p className="mt-1 text-sm text-muted-foreground">Thử đổi bộ lọc hoặc tạo hướng dẫn đầu tiên.</p>
          </div>
        ) : (
          <Table className="min-w-[960px] table-fixed">
            <TableHeader className="bg-primary/5">
              <TableRow>
                <TableHead className="w-[18%] px-5 text-xs uppercase text-primary">Loài cây</TableHead>
                <TableHead className="w-[16%] text-xs uppercase text-primary">Tưới nước</TableHead>
                <TableHead className="w-[16%] text-xs uppercase text-primary">Nhân giống</TableHead>
                <TableHead className="w-[16%] text-xs uppercase text-primary">Cắt tỉa</TableHead>
                <TableHead className="w-[16%] text-xs uppercase text-primary">Thay chậu</TableHead>
                <TableHead className="w-[10%] text-xs uppercase text-primary">Ngày tạo</TableHead>
                <TableHead className="w-[8%] px-5 text-right text-xs uppercase text-primary">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleGuides.map((guide) => {
                const plant = plantMap.get(String(guide.plantId));
                return (
                  <TableRow key={guide._id}>
                    <TableCell className="overflow-hidden px-5 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Sprout className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 overflow-hidden">
                          <span className="block truncate font-medium text-foreground">{plant?.name || "Cây không xác định"}</span>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="overflow-hidden whitespace-normal text-sm leading-5 text-muted-foreground">
                      <p className="line-clamp-3 break-words">{guide.watering || "Chưa có hướng dẫn"}</p>
                    </TableCell>
                    <TableCell className="overflow-hidden whitespace-normal text-sm leading-5 text-muted-foreground">
                      <p className="line-clamp-3 break-words">{guide.propagation || "Chưa có hướng dẫn"}</p>
                    </TableCell>
                    <TableCell className="overflow-hidden whitespace-normal text-sm leading-5 text-muted-foreground">
                      <p className="line-clamp-3 break-words">{guide.pruning || "Chưa có hướng dẫn"}</p>
                    </TableCell>
                    <TableCell className="overflow-hidden whitespace-normal text-sm leading-5 text-muted-foreground">
                      <p className="line-clamp-3 break-words">{guide.repotting || "Chưa có hướng dẫn"}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(guide.createdAt)}</TableCell>
                    <TableCell className="px-5 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(guide)} title="Chỉnh sửa">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => setDeletingGuide(guide)} title="Xóa">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {pageCount > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" disabled={safePage === 1} onClick={() => setPage((current) => Math.max(current - 1, 1))}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Trước
          </Button>
          <span className="px-2 text-sm text-muted-foreground">Trang {safePage} / {pageCount}</span>
          <Button variant="outline" size="sm" disabled={safePage === pageCount} onClick={() => setPage((current) => Math.min(current + 1, pageCount))}>
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
