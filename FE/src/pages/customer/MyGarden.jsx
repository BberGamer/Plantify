// MyGarden.jsx - Trang customer quản lý các cây cá nhân bằng CRUD My Garden
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import {
  AlertCircle,
  Loader2,
  Plus,
  RefreshCw,
  Sprout,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DeleteUserPlantDialog,
  MyGardenDashboard,
  MyGardenWeatherAdvice,
  UserPlantCard,
  UserPlantDetailDialog,
  UserPlantFormDialog,
  createUserPlantThenUpload,
  getApiErrorMessage,
  uploadUserPlantImage,
  useMyGarden,
} from "@/features/my-garden";
import { usePlants } from "@/features/plants/hooks";

function MyGarden() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedUserPlantId = searchParams.get("userPlantId") || "";
  const {
    userPlants,
    loading,
    saving,
    deletingId,
    error,
    refetch,
    create,
    update,
    remove,
    replaceUserPlant,
  } = useMyGarden();
  const {
    plants: catalogPlants,
    loading: catalogLoading,
    error: catalogError,
  } = usePlants({ page: 1, limit: 100 });

  const [formOpen, setFormOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [detailPlantId, setDetailPlantId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);

  const clearRequestedUserPlant = () => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      nextParams.delete("userPlantId");
      return nextParams;
    }, { replace: true });
  };

  useEffect(() => {
    if (!requestedUserPlantId || loading || error) return;
    const requestedPlant = userPlants.find(
      (userPlant) => userPlant._id === requestedUserPlantId
    );
    if (requestedPlant) {
      setDetailPlantId(requestedPlant._id);
      return;
    }

    toast.error("Cây này không còn tồn tại trong My Garden.", {
      id: `missing-user-plant-${requestedUserPlantId}`,
    });
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      nextParams.delete("userPlantId");
      return nextParams;
    }, { replace: true });
  }, [
    error,
    loading,
    requestedUserPlantId,
    setSearchParams,
    userPlants,
  ]);

  const openCreateDialog = () => {
    setEditingPlant(null);
    setFormOpen(true);
  };

  const openEditDialog = (userPlant) => {
    setEditingPlant(userPlant);
    setFormOpen(true);
  };

  const handleFormOpenChange = (nextOpen) => {
    setFormOpen(nextOpen);
    if (!nextOpen) setEditingPlant(null);
  };

  const handleSave = async (payload, pendingFiles = [], onUploadProgress) => {
    if (editingPlant?._id) {
      const updatedPlant = await update(editingPlant._id, payload);
      replaceUserPlant(updatedPlant);
      setDashboardRefreshKey((current) => current + 1);
      toast.success("Cập nhật cây thành công.");
      return;
    }

    const { failedUploads } = await createUserPlantThenUpload({
      createPlant: create,
      payload,
      files: pendingFiles,
      onProgress: onUploadProgress,
      uploadImage: async (userPlantId, file, reportProgress) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await uploadUserPlantImage(userPlantId, formData, (event) => {
          if (event.total) reportProgress(Math.round((event.loaded / event.total) * 100));
        });
        replaceUserPlant(response.data);
      },
    });
    refetch();
    setDashboardRefreshKey((current) => current + 1);
    if (failedUploads) {
      toast.error(`Cây đã được tạo nhưng ${failedUploads} ảnh tải thất bại.`);
    } else {
      toast.success("Đã thêm cây vào My Garden.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?._id) return;

    try {
      await remove(deleteTarget._id);
      setDashboardRefreshKey((current) => current + 1);
      if (detailPlantId === deleteTarget._id) {
        setDetailPlantId("");
        if (requestedUserPlantId === deleteTarget._id) {
          clearRequestedUserPlant();
        }
      }
      setDeleteTarget(null);
      toast.success("Đã xóa cây khỏi My Garden.");
    } catch (deleteError) {
      toast.error(getApiErrorMessage(
        deleteError,
        "Không thể xóa cây khỏi My Garden."
      ));
    }
  };

  const handleEditFromDetail = (userPlant) => {
    setDetailPlantId("");
    openEditDialog(userPlant);
  };

  const handleUserPlantChanged = (userPlant) => {
    replaceUserPlant(userPlant);
    setDashboardRefreshKey((current) => current + 1);
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <MyGardenWeatherAdvice />

        <MyGardenDashboard
          refreshKey={dashboardRefreshKey}
          onOpenPlant={setDetailPlantId}
          onAddPlant={openCreateDialog}
        />

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              Đang tải My Garden...
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">
                  Không thể tải My Garden
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              </div>
              <Button type="button" variant="outline" onClick={refetch}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Thử lại
              </Button>
            </CardContent>
          </Card>
        ) : userPlants.length === 0 ? (
          <Card className="border-dashed bg-white/80">
            <CardContent className="flex flex-col items-center py-20 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Sprout className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Khu vườn đang trống</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Thêm cây đầu tiên để bắt đầu quản lý khu vườn cá nhân của bạn.
              </p>
              <Button type="button" className="mt-6" onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm cây đầu tiên
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {userPlants.map((userPlant) => (
              <UserPlantCard
                key={userPlant._id}
                userPlant={userPlant}
                onView={(plant) => setDetailPlantId(plant._id)}
                onEdit={openEditDialog}
                onDelete={setDeleteTarget}
                deleting={deletingId === userPlant._id}
              />
            ))}
          </div>
        )}
      </div>

      <UserPlantFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        userPlant={editingPlant}
        catalogPlants={catalogPlants}
        catalogLoading={catalogLoading}
        catalogError={catalogError || ""}
        saving={saving}
        onSubmit={handleSave}
        onUserPlantChanged={handleUserPlantChanged}
      />

      <UserPlantDetailDialog
        open={Boolean(detailPlantId)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setDetailPlantId("");
            if (requestedUserPlantId) clearRequestedUserPlant();
          }
        }}
        userPlantId={detailPlantId}
        onEdit={handleEditFromDetail}
        onUserPlantChanged={handleUserPlantChanged}
      />

      <DeleteUserPlantDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDeleteTarget(null);
        }}
        userPlant={deleteTarget}
        deleting={deletingId === deleteTarget?._id}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export { MyGarden };
