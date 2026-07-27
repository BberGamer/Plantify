import {
  Loader2,
  Pencil,
  Trash2,
  Bug,
} from "lucide-react";
import { Card } from "@/components/ui/card";
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
import { DiseaseKnowledgeSummary } from "@/features/plant-diseases/components/DiseaseKnowledgeSummary";
import { getDiseaseCategoryLabel } from "@/features/plant-diseases/plantDiseaseForm.utils";
import { AffectedPlantsBadges } from "./AffectedPlantsBadges";

function ManageDiseasesTable({
  deleting,
  diseases,
  formatDate,
  onDelete,
  onEdit,
  loading,
  plants,
}) {
  return (
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
                              <span
                                className="
                                  absolute -bottom-1 -right-1 flex h-4 min-w-[16px] items-center
                                  justify-center rounded-full bg-black/60 px-1 text-[9px] font-bold
                                  leading-none text-white
                                "
                              >
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
                          onClick={() => onEdit(disease)}
                          title="Chỉnh sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => onDelete(disease)}
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
  );
}

export { ManageDiseasesTable };
