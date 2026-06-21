// AIDoctor.jsx - Trang AI Doctor chẩn đoán bệnh cây cảnh
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Camera, Sparkles, Bug, Leaf, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

function AIDoctor() {
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
                    <Button size="lg" className="w-full bg-gradient-to-r from-primary to-green-600">
                      <Upload className="w-5 h-5 mr-2" />
                      Chọn từ thiết bị
                    </Button>
                    <Button size="lg" variant="outline" className="w-full">
                      <Camera className="w-5 h-5 mr-2" />
                      Chụp ảnh
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Hỗ trợ: JPG, PNG, HEIC • Tối đa 10MB
                  </p>
                </div>
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
            <Card className="border-2 border-dashed border-border">
              <CardContent className="p-12 text-center">
                <Bug className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Tải ảnh lên để xem kết quả chẩn đoán
                </p>
              </CardContent>
            </Card>
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

export { AIDoctor };
