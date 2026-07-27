// AIDoctor.jsx - Trang AI Doctor chẩn đoán bệnh cây cảnh bằng hình ảnh
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  DiagnosisResultCard,
  useAIChat,
  usePlantDiagnosis,
} from '@/features/ai';
import { useAuth } from '@/features/auth/hooks';
import { useCartMutations } from '@/features/cart/hooks';
import {
  DiagnosisHistoryList,
  useDiagnosisHistory,
} from '@/features/diagnosis-history';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { Upload, Sparkles, Bug, ArrowRight, Loader2, X, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

function AIDoctor() {
  const fileInputRef = useRef(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const canLoadHistory = !authLoading && isAuthenticated;
  const historyId = searchParams.get('historyId') || '';
  const userPlantId = searchParams.get('userPlantId') || '';
  const diagnosis = usePlantDiagnosis({ userPlantId });
  const diagnosisHistory = useDiagnosisHistory({
    enabled: canLoadHistory,
    historyId,
    userPlantId,
    limit: 8,
  });
  const chat = useAIChat();
  const { addItem } = useCartMutations();
  const displayedResult = historyId
    ? diagnosisHistory.selectedResult
    : diagnosis.result;
  const displayedImageUrl = historyId
    ? diagnosisHistory.selectedHistory?.image?.url
    : diagnosis.previewUrl;

  const updateHistoryId = (nextHistoryId) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    if (nextHistoryId) {
      nextSearchParams.set('historyId', nextHistoryId);
    } else {
      nextSearchParams.delete('historyId');
    }
    setSearchParams(nextSearchParams);
  };

  const handleDiagnose = async () => {
    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để sử dụng tính năng chẩn đoán AI.');
      navigate('/login', { state: { from: '/ai-doctor' } });
      return;
    }

    updateHistoryId('');
    const result = await diagnosis.diagnose();
    if (result?.diagnosisHistoryId) {
      updateHistoryId(result.diagnosisHistoryId);
      diagnosisHistory.refreshHistories();
    }
  };

  const handleSelectHistory = (selectedHistoryId) => {
    diagnosis.clear();
    if (fileInputRef.current) fileInputRef.current.value = '';
    updateHistoryId(selectedHistoryId);
  };

  const handleNewDiagnosis = () => {
    diagnosis.clear();
    if (fileInputRef.current) fileInputRef.current.value = '';
    updateHistoryId('');
  };

  const handleAddToCart = async (product) => {
    try {
      await addItem({
        productId: product._id,
        quantity: 1,
        selected: true,
      });
      toast.success(`Đã thêm ${product.name} vào giỏ hàng.`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng.');
    }
  };

  useEffect(() => {
    const handleToggleAIChat = () => {
      setIsChatOpen((value) => !value);
    };

    window.addEventListener("plantify:toggle-ai-chat", handleToggleAIChat);

    return () => {
      window.removeEventListener("plantify:toggle-ai-chat", handleToggleAIChat);
    };
  }, []);

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Diagnosis</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">Bác sĩ cây cảnh AI</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tải ảnh lá cây lên để nhận chẩn đoán bệnh chính xác và hướng dẫn điều trị chi tiết
          </p>
        </motion.div>

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

        {/* How it works section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            AI hoạt động như thế nào?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-2">Phân tích hình ảnh</h3>
                <p className="text-sm text-muted-foreground">
                  AI sử dụng computer vision để nhận diện các dấu hiệu bệnh trên lá
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold mb-2">So sánh với cơ sở dữ liệu</h3>
                <p className="text-sm text-muted-foreground">
                  Hệ thống so sánh với hàng nghìn mẫu bệnh đã được học
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold mb-2">Đề xuất giải pháp</h3>
                <p className="text-sm text-muted-foreground">
                  Cung cấp phương pháp điều trị dựa trên kiến thức chuyên môn
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {isChatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm">
          <Card className="overflow-hidden border-primary/20 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-white/95 px-4 py-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                Chat AI
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsChatOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 bg-white p-4">
              <Textarea
                placeholder="Ví dụ: Tại sao lá cây tôi bị vàng? Cách xử lý thế nào?"
                rows={4}
                className="resize-none"
                value={chat.question}
                onChange={(e) => chat.setQuestion(e.target.value)}
              />
              <Button className="w-full" onClick={chat.ask} disabled={chat.isLoading}>
                {chat.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gửi cho AI
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {chat.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {chat.error}
                </div>
              )}
              {chat.answer && (
                <div className="max-h-56 overflow-y-auto rounded-xl border border-primary/20 bg-primary/5 px-4 py-4">
                  <p className="mb-2 text-sm font-medium text-primary">Phản hồi từ AI</p>
                  <p className="whitespace-pre-wrap text-sm text-foreground">{chat.answer}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}

export { AIDoctor };
