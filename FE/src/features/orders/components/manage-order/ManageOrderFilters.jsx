// ManageOrderFilters.jsx - Hiển thị bộ lọc và tìm kiếm danh sách đơn hàng
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

function ManageOrderFilters({ paymentFilter, search, setPaymentFilter, setSearch, setStatusFilter, statusFilter }) {
  return (
<Card className="border-green-200/60 bg-white/95 shadow-sm">
        <CardHeader className="border-b border-green-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-xl">Bộ lọc đơn hàng</CardTitle>
            </div>
            <Badge variant="outline" className="w-fit border-green-200 bg-green-50 text-green-700">
              Bộ lọc nâng cao
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            {/* Tìm kiếm */}
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo mã đơn hoặc khách hàng"
                className="pl-10"
              />
            </div>

            {/* Lọc theo trạng thái đơn */}
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái: Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Trạng thái: Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="packing">Đang đóng hàng</SelectItem>
                  <SelectItem value="sented">Đã gửi hàng</SelectItem>
                  <SelectItem value="succeeded">Nhận hàng thành công</SelectItem>
                  <SelectItem value="returning">Đang hoàn trả</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lọc theo thanh toán */}
            <div>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Thanh toán: Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Thanh toán: Tất cả</SelectItem>
                  <SelectItem value="pending">Chưa thanh toán</SelectItem>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="failed">Thanh toán lỗi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
  );
}

export { ManageOrderFilters };
