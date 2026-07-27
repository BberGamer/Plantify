// ManageDiseaseDialogView.jsx - Hiển thị biểu mẫu tạo hoặc chỉnh sửa bệnh cây
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { ImageUploader } from "@/components/common/ImageUploader";
import { DiseaseIdentityFields } from "../DiseaseIdentityFields";
import { DiseaseKnowledgeFields } from "../DiseaseKnowledgeFields";
import { RecommendedProductsPicker } from "../RecommendedProductsPicker";

function ManageDiseaseDialogView({ disease, form, handleFieldChange, handleNameChange, handleSubmit, linkedPlants, linkedProducts, loading, onOpenChange, open, plants, plantsError, plantsLoading, products, productsError, productsLoading, toggleAffectedPlant, toggleRecommendedProduct }) {
  return (
<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {disease ? "Chỉnh sửa bệnh cây" : "Thêm bệnh cây mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <DiseaseIdentityFields
            open={open}
            form={form}
            plants={plants}
            linkedPlants={linkedPlants}
            plantsLoading={plantsLoading}
            plantsError={plantsError}
            onNameChange={handleNameChange}
            onFieldChange={handleFieldChange}
            onTogglePlant={toggleAffectedPlant}
          />

          <DiseaseKnowledgeFields
            form={form}
            onFieldChange={handleFieldChange}
          />

          <RecommendedProductsPicker
            open={open}
            products={products}
            linkedProducts={linkedProducts}
            selectedProductIds={form.recommendedProducts}
            loading={productsLoading}
            error={productsError}
            onToggle={toggleRecommendedProduct}
          />

          <section className="space-y-4 border-t pt-5">
            <div className="space-y-2">
              <Label>Hình ảnh bệnh cây</Label>
              <ImageUploader
                images={form.images}
                onChange={(images) => handleFieldChange("images", images)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3">
              <div>
                <Label htmlFor="md-is-active">Cho phép sử dụng trong chẩn đoán</Label>
                <p className="text-xs text-muted-foreground">
                  Tắt để giữ dữ liệu nhưng không cho pipeline AI sử dụng.
                </p>
              </div>
              <Switch
                id="md-is-active"
                checked={form.isActive}
                onCheckedChange={(checked) => handleFieldChange("isActive", checked)}
              />
            </div>
          </section>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {disease ? "Lưu thay đổi" : "Tạo bệnh mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { ManageDiseaseDialogView };
