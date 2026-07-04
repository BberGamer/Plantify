/**
 * AIDoctorSection.jsx - Section Plant Doctor AI trên Homepage
 * Hiển thị danh sách bệnh có thể chuẩn đoán và example result
 */
import { Link } from "react-router";
import { CircleCheck, Leaf, Sparkles, Droplets, Bug, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const diagnoses = [
  "Leaf spots and mildew",
  "Yellow leaves and chlorosis",
  "Wilting and drooping",
  "Root rot and drainage stress",
  "Fungus gnats and soil pests",
  "Spider mites, thrips, scale",
  "Watering stress issues",
  "Nutrient and light problems",
];

export function AIDoctorSection() {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-stretch">
        {/* === Cột trái: Danh sách bệnh === */}
        <div className="bg-white rounded-2xl p-8 border border-[#a5d6a7] shadow-sm">
          {/* Tiêu đề */}
          <h2 className="text-2xl font-bold text-[#1b4332] mb-6 flex items-center gap-2">
            <Leaf className="w-6 h-6 text-[#2d6a4f]" />
            What PlantDoctor can diagnose
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
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#f59e0b]" />
              Example result
            </h3>
          </div>

          {/* Likely cause */}
          <div className="bg-[#d8f3dc] rounded-xl p-4">
            <div className="text-xs text-[#2d6a4f] mb-1">Likely cause</div>
            <div className="font-semibold text-[#1b4332]">
              Root stress from overwatering
            </div>
          </div>

          {/* Confidence badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Confidence</span>
            <span className="bg-[#fef3c7] text-[#92400e] px-3 py-1 rounded-full text-sm font-semibold">
              78%
            </span>
          </div>

          {/* Observation tags */}
          <div className="space-y-2">
            <div className="flex items-start gap-2 bg-[#eff6ff] rounded-lg p-3">
              <Droplets className="w-4 h-4 text-[#3b82f6] mt-0.5 flex-shrink-0" />
              <span className="text-xs text-[#475569]">Soggy soil and soft stem base</span>
            </div>
            <div className="flex items-start gap-2 bg-[#fef2f2] rounded-lg p-3">
              <Bug className="w-4 h-4 text-[#ef4444] mt-0.5 flex-shrink-0" />
              <span className="text-xs text-[#475569]">No visible pest residue</span>
            </div>
          </div>

          {/* First steps */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1">
              <CircleAlert className="w-3 h-3" />
              First steps
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>1. Stop watering and let soil dry completely.</p>
              <p>2. Check drainage holes are not blocked.</p>
              <p>3. Trim any soft or brown roots if repotting.</p>
              <p>4. Move to indirect light and monitor.</p>
            </div>
          </div>

          {/* Button */}
          <Button className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-medium mt-auto">
            <Link to="/ai-doctor" className="flex items-center justify-center gap-2 w-full">
              Try PlantDoctor
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}