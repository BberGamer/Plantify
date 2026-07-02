// AIDoctor.jsx - Trang AI Doctor chẩn đoán bệnh cây cảnh bằng hình ảnh
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useAIChat, usePlantDiagnosis } from '@/features/ai';
import { Upload, Sparkles, Bug, Leaf, ArrowRight, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

function AIDoctor() {
  const fileInputRef = useRef(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const diagnosis = usePlantDiagnosis();
  const chat = useAIChat();

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
            <Card className="h-full border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
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
                        Hỗ trợ: JPG, PNG, WebP • Tối đa 10MB
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
                        onClick={diagnosis.diagnose}
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
            {/* Diagnosis Result */}
            {diagnosis.result ? (
              <Card className="h-full border-2 border-primary/50 bg-gradient-to-br from-primary/5 to-green-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Kết quả chẩn đoán
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex h-full flex-col justify-center space-y-4">
                  <div className="text-center py-4">
                    <Leaf className="w-12 h-12 text-primary mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-1">Bệnh</p>
                    <h3 className="text-2xl font-bold text-primary">
                      {diagnosis.result.label?.split('___').map((part) => part.replace(/_/g, ' ')).join(' - ')}
                    </h3>
                    {diagnosis.result.description ? (
                      <p className="mt-3 text-sm leading-6 text-muted-foreground max-w-md mx-auto">
                        {diagnosis.result.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Độ chính xác</span>
                      <span className="font-semibold">
                        {(diagnosis.result.confidence * 100).toFixed(2)}%
                      </span>
                    </div>
                    <Progress
                      value={diagnosis.result.confidence * 100}
                      className="h-3"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Kết quả dựa trên mô hình AI EfficientNet đã được huấn luyện
                  </p>
                </CardContent>
              </Card>
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
