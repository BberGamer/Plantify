// AIDoctor.jsx - Trang AI Doctor chẩn đoán bệnh cây cảnh bằng hình ảnh
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  DiagnosisResultCard,
  useAIDoctorPage,
} from '@/features/ai';
import { DiagnosisHistoryList } from '@/features/diagnosis-history';
import { Upload, Sparkles, Bug, ArrowRight, Loader2, X, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { AIDoctorWorkspace } from "@/features/ai/components/ai-doctor/AIDoctorWorkspace";

function AIDoctor() {
  const {
    chat,
    diagnosis,
    diagnosisHistory,
    displayedImageUrl,
    displayedResult,
    fileInputRef,
    handleAddToCart,
    handleDiagnose,
    handleNewDiagnosis,
    handleSelectHistory,
    historyId,
    isChatOpen,
    setIsChatOpen,
    isAuthenticated,
    authLoading
  } = useAIDoctorPage();

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

        <AIDoctorWorkspace authLoading={authLoading} diagnosis={diagnosis} diagnosisHistory={diagnosisHistory} displayedResult={displayedResult} fileInputRef={fileInputRef} handleAddToCart={handleAddToCart} handleDiagnose={handleDiagnose} handleNewDiagnosis={handleNewDiagnosis} handleSelectHistory={handleSelectHistory} historyId={historyId} isAuthenticated={isAuthenticated} />

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
