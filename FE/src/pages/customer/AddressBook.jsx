import { Link, Navigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAddressBook, useAuth } from "@/features/auth/hooks";
import { CheckCircle2, Home, Loader2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";

function AddressBook() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const {
    addresses,
    editingId,
    form,
    handleDelete,
    handleEdit,
    handleProvinceChange,
    handleSetDefault,
    handleSubmit,
    loading,
    provinces,
    resetForm,
    saving,
    selectedProvince,
    setForm,
  } = useAddressBook(!authLoading && isAuthenticated, user);

  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: "/address-book" }} replace />;
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/30 to-white px-4 py-16">
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang tải sổ địa chỉ...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 to-white px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">Trang chủ</Link>
              <span>/</span>
              <span className="font-medium text-foreground">Sổ địa chỉ</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Sổ địa chỉ</h1>
          </div>
          <Button type="button" variant="outline" onClick={resetForm}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm mới
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <Card className="border-green-100 shadow-sm">
            <CardContent className="p-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">{editingId ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}</h2>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tên gợi nhớ</label>
                  <Input
                    value={form.label}
                    onChange={(event) => setForm((prev) => ({ ...prev, label: event.target.value }))}
                    placeholder="Nhà riêng, công ty..."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Người nhận</label>
                    <Input
                      value={form.receiverName}
                      onChange={(event) => setForm((prev) => ({ ...prev, receiverName: event.target.value }))}
                      placeholder="Họ và tên"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Số điện thoại</label>
                    <Input
                      value={form.phone}
                      onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                      placeholder="09xxxxxxxx"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                    <Select value={form.provinceCode} onValueChange={handleProvinceChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tỉnh/thành" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province.code} value={province.code}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Xã/Phường <span className="text-red-500">*</span></label>
                    <Select
                      value={form.wardCode}
                      onValueChange={(wardCode) => setForm((prev) => ({ ...prev, wardCode }))}
                      disabled={!selectedProvince}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn xã/phường" />
                      </SelectTrigger>
                      <SelectContent>
                        {(selectedProvince?.wards || []).map((ward) => (
                          <SelectItem key={ward.code} value={ward.code}>
                            {ward.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Địa chỉ chi tiết <span className="text-red-500">*</span></label>
                  <Textarea
                    value={form.street}
                    onChange={(event) => setForm((prev) => ({ ...prev, street: event.target.value }))}
                    placeholder="Số nhà, tên đường, tòa nhà..."
                    className="min-h-24"
                  />
                </div>

                <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                  <Checkbox
                    checked={form.isDefault}
                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isDefault: Boolean(checked) }))}
                  />
                  Chọn làm địa chỉ mặc định
                </label>

                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-green-600" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? "Lưu thay đổi" : "Thêm địa chỉ"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {addresses.length ? (
              addresses.map((address) => (
                <Card key={address._id} className="border-green-100 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Home className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold">{address.label}</h3>
                          {address.isDefault && (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Mặc định
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          {address.receiverName || user?.fullName} {address.phone ? `- ${address.phone}` : ""}
                        </p>
                        <p className="text-sm leading-6 text-muted-foreground">{address.fullAddress}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!address.isDefault && (
                          <Button type="button" size="sm" variant="outline" onClick={() => handleSetDefault(address._id)}>
                            Đặt mặc định
                          </Button>
                        )}
                        <Button type="button" size="icon" variant="outline" onClick={() => handleEdit(address)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button type="button" size="icon" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDelete(address._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-dashed border-green-200 shadow-sm">
                <CardContent className="p-10 text-center">
                  <MapPin className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <h3 className="font-semibold">Chưa có địa chỉ nào</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Thêm địa chỉ để checkout tự điền thông tin giao hàng.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { AddressBook };
