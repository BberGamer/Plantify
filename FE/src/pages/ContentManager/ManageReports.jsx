// ManageReports.jsx - Trang xử lý report cho Content Manager
import { Flag, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";

function ManageReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Xử lý report</h1>
        <p className="text-sm text-muted-foreground">
          Theo dõi và xử lý các nội dung được người dùng báo cáo.
        </p>
      </div>

      <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Flag className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold">Chưa có report cần xử lý</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Danh sách report sẽ hiển thị tại đây khi có dữ liệu từ hệ thống.
        </p>
        <div className="mt-6 flex items-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground">
          <Inbox className="h-4 w-4" />
          <span>Đang chờ kết nối dữ liệu report</span>
        </div>
      </Card>
    </div>
  );
}

export { ManageReports };
