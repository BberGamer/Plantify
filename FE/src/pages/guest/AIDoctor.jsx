import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  Camera,
  Sparkles,
  Bug,
  Leaf,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { motion } from "motion/react";
import {
  MOCK_AI_DIAGNOSIS,
  MOCK_AI_SAMPLE_IMAGE
} from "@/lib/mock-data";

function AIDoctor() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleImageUpload = () => {
    setUploadedImage(MOCK_AI_SAMPLE_IMAGE);
    setShowResult(true);
  };

  const result = showResult ? MOCK_AI_DIAGNOSIS : null;

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
            <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                {!uploadedImage ? (
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
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
                        onClick={handleImageUpload}
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Chọn từ thiết bị
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full"
                        onClick={handleImageUpload}
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Chụp ảnh
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Hỗ trợ: JPG, PNG, HEIC • Tối đa 10MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="aspect-square rounded-xl overflow-hidden">
                      <img
                        src={uploadedImage}
                        alt="Uploaded plant"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setUploadedImage(null);
                        setShowResult(false);
                      }}
                    >
                      Tải ảnh khác
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Hỏi AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Ví dụ: Tại sao lá cây tôi bị vàng? Cách xử lý thế nào?"
                  rows={4}
                  className="resize-none"
                />
                <Button className="w-full">
                  Gửi câu hỏi
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <Card className="border-2 border-green-200 bg-green-50/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-green-800 mb-2">
                          <Bug className="w-6 h-6" />
                          Kết quả chẩn đoán
                        </CardTitle>
                        <h3 className="text-2xl font-bold text-green-900">
                          {result.disease}
                        </h3>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        {result.confidence}% chính xác
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Mức độ nghiêm trọng</p>
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                          {result.severity}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Chẩn đoán chi tiết</p>
                        <p className="text-sm">{result.diagnosis}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-primary" />
                      Phương pháp điều trị
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.treatments.map((treatment, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-sm font-bold text-primary">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-semibold">{treatment.title}</h4>
                              <Badge
                                variant={treatment.priority === "Cao" ? "destructive" : "secondary"}
                                className="text-xs"
                              >
                                {treatment.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {treatment.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-blue-900 mb-1">Lưu ý quan trọng</p>
                        <p className="text-blue-800">
                          Nếu tình trạng không cải thiện sau 2 tuần, hãy cô lập cây và kiểm tra thêm các dấu hiệu bệnh khác.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full" size="lg">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Lưu kết quả vào lịch sử
                </Button>
              </motion.div>
            )}

            {!uploadedImage && !result && (
              <Card className="border-2 border-dashed border-border">
                <CardContent className="p-12 text-center">
                  <Bug className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Tải ảnh lên để xem kết quả chẩn đoán
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

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

export {
  AIDoctor
};
