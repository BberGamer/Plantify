// AIDoctor.jsx - Trang AI Doctor chẩn đoán bệnh cây cảnh bằng hình ảnh
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { Upload, Camera, Sparkles, Bug, Leaf, ArrowRight, Loader2, X, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

function AIDoctor() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisError, setDiagnosisError] = useState("");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [chatError, setChatError] = useState("");
  const [isChatting, setIsChatting] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setDiagnosisError("Định dạng ảnh không được hỗ trợ. Vui lòng sử dụng JPG, PNG, hoặc WebP.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setDiagnosisError("Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB.");
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setDiagnosisResult(null);
    setDiagnosisError("");
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const clearSelection = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setDiagnosisResult(null);
    setDiagnosisError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDiagnose = async () => {
    if (!selectedImage) {
      setDiagnosisError("Vui lòng chọn ảnh lá cây để chẩn đoán.");
      return;
    }

    setIsDiagnosing(true);
    setDiagnosisError("");
    setDiagnosisResult(null);

    const formData = new FormData();
    formData.append("file", selectedImage);

    try {
      const response = await api.post("/ai/diagnose", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000,
      });

      const prediction = response.data?.data?.prediction;
      if (prediction) {
        setDiagnosisResult({
          label: prediction.label,
          confidence: prediction.confidence,
        });
      } else {
        setDiagnosisError("Kết quả không hợp lệ từ server.");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      if (errorMsg.includes("ECONNREFUSED") || errorMsg.includes("AI service")) {
        setDiagnosisError("AI service không khả dụng. Vui lòng khởi động AI Service (FastAPI).");
      } else if (error.code === "ECONNABORTED") {
        setDiagnosisError("Yêu cầu chẩn đoán hết thời gian. Vui lòng thử lại.");
      } else {
        setDiagnosisError(errorMsg || "Chẩn đoán thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleAskGemini = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setChatError("Vui lòng nhập câu hỏi cho Gemini");
      setAnswer("");
      return;
    }

    setIsChatting(true);
    setChatError("");

    try {
      const response = await api.post("/ai/chat", { prompt: trimmedQuestion });
      setAnswer(response.data?.data?.text || "Gemini chưa trả về nội dung.");
    } catch (apiError) {
      setAnswer("");
      setChatError(apiError.response?.data?.message || "Không thể gọi Gemini lúc này");
    } finally {
      setIsChatting(false);
    }
  };

  const formatDiseaseName = (label) => {
    if (!label) return "";
    return label
      .split("___")
      .map((part, index) => {
        if (index === 0) return part.replace(/_/g, " ");
        return part.replace(/_/g, " ");
      })
      .join(" - ");
  };

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

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Image Upload Section */}
            <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  {!previewUrl ? (
                    <>
                      <div
                        className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto cursor-pointer hover:bg-primary/20 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
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
                        <Button
                          size="lg"
                          variant="outline"
                          className="w-full"
                          onClick={() => cameraInputRef.current?.click()}
                        >
                          <Camera className="w-5 h-5 mr-2" />
                          Chụp ảnh
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
                        onChange={handleFileSelect}
                      />
                      <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        capture="environment"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative mx-auto max-w-sm">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full rounded-lg object-contain max-h-64"
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                          onClick={clearSelection}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedImage?.name}</p>
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-primary to-green-600"
                        onClick={handleDiagnose}
                        disabled={isDiagnosing}
                      >
                        {isDiagnosing ? (
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

            {/* Diagnosis Result */}
            {diagnosisError && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-700">Lỗi chẩn đoán</p>
                      <p className="text-sm text-red-600 mt-1">{diagnosisError}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {diagnosisResult && (
              <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/5 to-green-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Kết quả chẩn đoán
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <Leaf className="w-12 h-12 text-primary mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-1">Bệnh</p>
                    <h3 className="text-2xl font-bold text-primary">
                      {formatDiseaseName(diagnosisResult.label)}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Độ chính xác</span>
                      <span className="font-semibold">
                        {(diagnosisResult.confidence * 100).toFixed(2)}%
                      </span>
                    </div>
                    <Progress
                      value={diagnosisResult.confidence * 100}
                      className="h-3"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Kết quả dựa trên mô hình AI EfficientNet đã được huấn luyện
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Gemini Chat Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Hỏi Gemini AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Ví dụ: Tại sao lá cây tôi bị vàng? Cách xử lý thế nào?"
                  rows={4}
                  className="resize-none"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                />
                <Button className="w-full" onClick={handleAskGemini} disabled={isChatting}>
                  {isChatting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Gửi cho Gemini
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                {chatError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {chatError}
                  </div>
                )}
                {answer && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-4">
                    <p className="mb-2 text-sm font-medium text-primary">Phản hồi từ Gemini</p>
                    <p className="whitespace-pre-wrap text-sm text-foreground">{answer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Instructions */}
          <div className="space-y-6">
            <Card className="border-2 border-dashed border-border">
              <CardContent className="p-12 text-center">
                <Bug className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Tải ảnh lên để xem kết quả chẩn đoán
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mẹo chụp ảnh tốt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p className="text-sm">Chụp ảnh lá cây rõ nét, có ánh sáng tự nhiên</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p className="text-sm">Đảm bảo vùng bệnh trên lá chiếm ít nhất 50% diện tích ảnh</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <p className="text-sm">Tránh nền phức tạp, ưu tiên nền đơn giản</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">4</span>
                  </div>
                  <p className="text-sm">Chụp nhiều góc độ để có kết quả chính xác hơn</p>
                </div>
              </CardContent>
            </Card>
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
    </div>
  );
}

export { AIDoctor };
