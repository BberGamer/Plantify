import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DiagnosisResultCard } from "@/features/ai";
import { DiagnosisHistoryList } from "@/features/diagnosis-history";
import { Upload, Bug, Loader2, X, AlertCircle } from "lucide-react";

function AIDoctorWorkspace({
  authLoading,
  diagnosis,
  diagnosisHistory,
  displayedResult,
  fileInputRef,
  handleAddToCart,
  handleDiagnose,
  handleNewDiagnosis,
  handleSelectHistory,
  historyId,
  isAuthenticated,
}) {
  return (
<div className="grid md:grid-cols-2 gap-8 md:items-stretch">
          <div className="space-y-6 h-full">
            {/* Image Upload Section */}
            <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  {!diagnosis.previewUrl ? (
                    <>
                      <div
                        className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto cursor-pointer hover:bg-primary/20 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={(e) => diagnosis.processFile(e.dataTransfer.files?.[0])}
                        onDragOver={(e) => e.preventDefault()}
                      >
                        <Upload className="w-12 h-12 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Tải ảnh lá cây lên</h3>
                        <p className="text-muted-foreground">
                          Chọn ảnh rõ nét của lá cây để AI phân tích
                        </p>
                      </div>
                      <div className="flex flex-col gap-3">
                        <Button
                          size="lg"
                          className="w-full bg-gradient-to-r from-primary to-green-600"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-5 h-5 mr-2" />
                          Chọn từ thiết bị
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Hỗ trợ: JPG, PNG, WebP • Tối đa 5MB
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => diagnosis.processFile(e.target.files?.[0])}
                      />
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative mx-auto max-w-sm">
                        <img
                          src={diagnosis.previewUrl}
                          alt="Preview"
                          className="w-full rounded-lg object-contain max-h-64"
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                          onClick={diagnosis.clear}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{diagnosis.selectedImage?.name}</p>
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-primary to-green-600"
                        onClick={handleDiagnose}
                        disabled={diagnosis.isLoading}
                      >
                        {diagnosis.isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Đang chẩn đoán...
                          </>
                        ) : (
                          <>
                            <Bug className="w-5 h-5 mr-2" />
                            Chẩn đoán bệnh
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <DiagnosisHistoryList
              enabled={isAuthenticated}
              authLoading={authLoading}
              histories={diagnosisHistory.histories}
              selectedHistoryId={historyId}
              loading={diagnosisHistory.listLoading}
              error={diagnosisHistory.listError}
              onSelect={handleSelectHistory}
              onRetry={diagnosisHistory.refreshHistories}
            />

            {/* Diagnosis Error */}
            {diagnosis.error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-700">Lỗi chẩn đoán</p>
                      <p className="text-sm text-red-600 mt-1">{diagnosis.error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

          {/* Right Column - Diagnosis Result */}
          <div className="space-y-6 h-full">
            {historyId && authLoading ? (
              <Card className="h-full">
                <CardContent className="flex h-full items-center justify-center gap-2 p-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang kiểm tra phiên đăng nhập...
                </CardContent>
              </Card>
            ) : historyId && !isAuthenticated ? (
              <Card className="h-full border-amber-200 bg-amber-50">
                <CardContent className="flex h-full flex-col items-center justify-center gap-4 p-12 text-center">
                  <AlertCircle className="h-10 w-10 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    Vui lòng đăng nhập để xem lịch sử chẩn đoán này.
                  </p>
                </CardContent>
              </Card>
            ) : historyId && diagnosisHistory.detailLoading ? (
              <Card className="h-full">
                <CardContent className="flex h-full items-center justify-center gap-2 p-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang tải kết quả chẩn đoán...
                </CardContent>
              </Card>
            ) : historyId && diagnosisHistory.detailError ? (
              <Card className="h-full border-red-200 bg-red-50">
                <CardContent className="flex h-full flex-col items-center justify-center gap-4 p-12 text-center">
                  <AlertCircle className="h-10 w-10 text-red-500" />
                  <p className="text-sm text-red-700">
                    {diagnosisHistory.detailError}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={diagnosisHistory.refreshSelectedHistory}
                    >
                      Thử lại
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : displayedResult ? (
              <DiagnosisResultCard
                result={displayedResult}
                onAddToCart={handleAddToCart}
                onNewDiagnosis={handleNewDiagnosis}
              />
            ) : (
              <Card className="h-full border-2 border-dashed border-border">
                <CardContent className="flex h-full flex-col items-center justify-center p-12 text-center">
                  <Bug className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Tải ảnh lên để xem kết quả chẩn đoán
                  </p>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
  );
}

export { AIDoctorWorkspace };
