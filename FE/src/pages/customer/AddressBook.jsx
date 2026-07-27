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
import { AddressBookContent } from "@/features/auth/components/address-book/AddressBookContent";

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
    <AddressBookContent addresses={addresses} editingId={editingId} form={form} handleDelete={handleDelete} handleEdit={handleEdit} handleProvinceChange={handleProvinceChange} handleSetDefault={handleSetDefault} handleSubmit={handleSubmit} provinces={provinces} resetForm={resetForm} saving={saving} selectedProvince={selectedProvince} setForm={setForm} user={user} />
  );
}

export { AddressBook };
