import { Outlet, useNavigate } from "react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingAIButton } from "@/components/common/FloatingAIButton";
import { ROUTES } from "@/lib/constants";

const NATURE_BG =
  "linear-gradient(rgba(255,255,255,0.88), rgba(255,255,255,0.88)), url('https://images.unsplash.com/photo-1656874370240-c67aeb8bd048?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')";
const NATURE_BG_DARK =
  "linear-gradient(rgba(15,23,20,0.92), rgba(15,23,20,0.92)), url('https://images.unsplash.com/photo-1656874370240-c67aeb8bd048?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')";

function PublicLayout() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed dark:[background-image:var(--bg-dark)] [background-image:var(--bg-light)]"
      style={{
        "--bg-light": NATURE_BG,
        "--bg-dark": NATURE_BG_DARK
      }}
    >
      <Header />
      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
      <Footer />
      <FloatingAIButton onClick={() => navigate(ROUTES.aiDoctor)} />
    </div>
  );
}

export { PublicLayout };
