// CareGuidesTable.jsx - Hiển thị bảng hướng dẫn chăm sóc và các thao tác quản lý
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen, Loader2, Pencil, Sprout, Trash2 } from "lucide-react";

function CareGuidesTable({
  formatDate,
  loading,
  loadingPlants,
  onDelete,
  onEdit,
  plantMap,
  visibleGuides,
}) {
  return (
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
                  <Button variant="ghost" size="icon" onClick={() => onEdit(guide)} title="Chỉnh sửa">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => onDelete(guide)} title="Xóa">
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
  );
}

export { CareGuidesTable };
