/**
 * AIDoctorSection.jsx - Section giới thiệu AI Doctor
 */
import { Link } from "react-router";
import { Sparkles, Bug, Leaf, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AIDoctorSection() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <div className="ai-badge mb-4">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">AI-Powered</span>
        </div>
        <h2 className="text-4xl font-bold mb-4">Bác sĩ cây cảnh AI</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Chẩn đoán bệnh và nhận tư vấn chăm sóc chỉ bằng một bức ảnh
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="marketplace-card">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Bug className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2 text-lg">Phát hiện bệnh</h3>
            <p className="text-muted-foreground text-sm">
              AI phân tích và nhận diện các dấu hiệu bệnh trên lá cây
            </p>
          </CardContent>
        </Card>

        <Card className="marketplace-card">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2 text-lg">Đề xuất điều trị</h3>
            <p className="text-muted-foreground text-sm">
              Nhận hướng dẫn chi tiết về cách chăm sóc và điều trị
            </p>
          </CardContent>
        </Card>

        <Card className="marketplace-card">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2 text-lg">Tư vấn AI</h3>
            <p className="text-muted-foreground text-sm">
              Trao đổi thêm với Gemini để hiểu rõ nguyên nhân và cách xử lý
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button size="lg" className="bg-gradient-to-r from-primary to-green-600" asChild>
          <Link to="/ai-doctor">
            <Sparkles className="w-5 h-5 mr-2" />
            Khám phá bác sĩ AI
          </Link>
        </Button>
      </div>
    </section>
  );
}
