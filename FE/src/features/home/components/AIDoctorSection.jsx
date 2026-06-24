/**
 * AIDoctorSection.jsx - Section giới thiệu AI Doctor
 */
import { Link } from "react-router";
import { Sparkles, Upload, Bug, Leaf, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AIDoctorSection() {
  return (
    <section className="py-20 px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-green-50/30 to-transparent" />
      {/* Dot pattern */}
      <div className="absolute inset-0 ai-section-pattern opacity-20" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="ai-badge mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Bác sĩ cây cảnh AI</h2>
          <p className="text-muted-foreground text-lg">
            Chẩn đoán bệnh và nhận tư vấn chăm sóc chỉ bằng một bức ảnh
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Upload Card */}
          <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tải ảnh lá cây lên</h3>
              <p className="text-muted-foreground mb-6">
                Chụp hoặc tải ảnh lá cây cần chẩn đoán
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-green-600"
                asChild
              >
                <Link to="/ai-doctor">Chọn ảnh</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Features List */}
          <div className="space-y-4">
            {/* Disease Detection */}
            <Card className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Bug className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Phát hiện bệnh</h4>
                    <p className="text-sm text-muted-foreground">
                      AI phân tích và nhận diện các dấu hiệu bệnh trên lá cây
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-[95%] bg-gradient-to-r from-primary to-green-600" />
                      </div>
                      <span className="text-sm font-medium">95%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Treatment Suggestion */}
            <Card className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Đề xuất điều trị</h4>
                    <p className="text-sm text-muted-foreground">
                      Nhận hướng dẫn chi tiết về cách chăm sóc và điều trị
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Care Schedule */}
            <Card className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Lịch chăm sóc</h4>
                    <p className="text-sm text-muted-foreground">
                      Nhận nhắc nhở tưới nước, bón phân theo lịch trình
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
