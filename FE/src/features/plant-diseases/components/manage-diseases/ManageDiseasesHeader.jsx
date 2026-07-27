import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

function ManageDiseasesHeader({
  onCreate,
  onPageReset,
  onSearchChange,
  search,
  total,
}) {
  return (
    <>
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
        <Button onClick={onCreate} className="rounded-full px-5">
          <Plus className="mr-2 h-4 w-4" />
          Thêm bệnh mới
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              onSearchChange(event.target.value);
              onPageReset();
            }}
            placeholder="Tìm tên bệnh, canonical key, alias, triệu chứng hoặc cây..."
            className="rounded-full bg-card pl-10"
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Hiển thị <span className="font-medium text-foreground">{total}</span> loại bệnh
      </p>
    </>
  );
}

export { ManageDiseasesHeader };
