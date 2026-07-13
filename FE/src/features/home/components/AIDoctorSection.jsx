/**
 * AIDoctorSection.jsx - Section Plant Doctor AI trên Homepage
 * Hiển thị danh sách bệnh có thể chuẩn đoán và example result
 */
import { Link } from "react-router";
import { CircleCheck, Leaf, Sparkles, Droplets, Bug, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const diagnoses = [
  "Đốm lá và nấm mốc",
  "Lá vàng và bệnh vàng lá",
  "Lá héo và rủ xuống",
  "Thối rễ và ngập úng",
  "Ruồi nấm và sâu đất",
  "Nhện đỏ, bọ trĩ, rệp sáp",
  "Vấn đề tưới nước",
  "Thiếu dinh dưỡng và ánh sáng",
  "Cháy nắng và sốc nhiệt",
  "Nấm thân và gỉ sắt",
];

export function AIDoctorSection() {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* === Cột trái: Danh sách bệnh === */}
        <div className="bg-white rounded-2xl p-8 border border-[#a5d6a7] shadow-sm">
          {/* Tiêu đề */}
          <h2 className="text-2xl font-bold text-[#1b4332] mb-6 flex items-center gap-2">
            <Leaf className="w-6 h-6 text-[#2d6a4f]" />
            PlantDoctor có thể chẩn đoán
          </h2>

          {/* Grid items */}
          <div className="grid grid-cols-2 gap-3">
            {diagnoses.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-2.5 border border-[#a5d6a7]"
              >
                <CircleCheck className="w-4 h-4 text-[#4caf50] flex-shrink-0" />
                <span className="text-sm font-medium text-[#2e2e2e]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* === Cột phải: Example result card === */}
        <div className="bg-white rounded-2xl shadow-lg p-7 space-y-5 w-full max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#f59e0b]" />
              Kết quả mẫu
            </h3>
          </div>

          {/* Likely cause */}
          <div className="bg-[#d8f3dc] rounded-xl p-4">
            <div className="text-xs text-[#2d6a4f] mb-1">Nguyên nhân có thể</div>
            <div className="font-semibold text-[#1b4332]">
              Rễ bị stress do tưới quá nhiều
            </div>
          </div>

          {/* Confidence progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Độ tin cậy</span>
              <span className="text-sm font-semibold text-[#1b4332]">78%</span>
            </div>
            <div className="h-2 w-full bg-[#e5e7eb] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#4caf50] to-[#2d6a4f] rounded-full transition-all"
                style={{ width: "78%" }}
              />
            </div>
          </div>

          {/* Observation tags */}
          <div className="space-y-2">
            <div className="flex items-start gap-2 bg-[#eff6ff] rounded-lg p-3">
              <Droplets className="w-4 h-4 text-[#3b82f6] mt-0.5 flex-shrink-0" />
              <span className="text-xs text-[#475569]">Đất ẩm và gốc cây mềm</span>
            </div>
            <div className="flex items-start gap-2 bg-[#fef2f2] rounded-lg p-3">
              <Bug className="w-4 h-4 text-[#ef4444] mt-0.5 flex-shrink-0" />
              <span className="text-xs text-[#475569]">Không có dấu hiệu sâu bệnh</span>
            </div>
          </div>

          {/* First steps */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1">
              <CircleAlert className="w-3 h-3" />
              Bước xử lý đầu tiên
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>1. Ngưng tưới và để đất khô hoàn toàn.</p>
              <p>2. Kiểm tra lỗ thoát nước không bị tắc.</p>
              <p>3. Cắt bỏ rễ mềm hoặc rễ nâu khi thay chậu.</p>
              <p>4. Chuyển cây ra nơi ánh sáng gián tiếp và theo dõi.</p>
            </div>
          </div>

          {/* Button */}
          <Button className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-medium">
            <Link to="/ai-doctor" className="flex items-center justify-center gap-2 w-full">
              Trải nghiệm Bác sĩ AI
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}