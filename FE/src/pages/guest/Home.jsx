// Home.jsx - Hiển thị trang chủ với các khu vực giới thiệu chính của Plantify
import "@/styles/Home.css";

import { HeroSection } from "@/features/home/components/HeroSection";
import { PlantListSection } from "@/features/home/components/PlantListSection";
import { AIDoctorSection } from "@/features/home/components/AIDoctorSection";
import { MarketplaceSection } from "@/features/home/components/MarketplaceSection";
import { BlogSection } from "@/features/home/components/BlogSection";

function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <PlantListSection />
      <AIDoctorSection />
      <MarketplaceSection />
      <BlogSection />
    </div>
  );
}

export { Home };
