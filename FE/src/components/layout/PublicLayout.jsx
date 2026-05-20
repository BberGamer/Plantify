import { Outlet, useNavigate } from "react-router";
import { Leaf } from "lucide-react";
import { Header } from "@/components/layout/Header";
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
      <footer className="mt-16 border-t border-border bg-muted/30 px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Plantify</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Nền tảng tri thức cây cảnh thông minh — AI & Neo4j
          </p>
        </div>
      </footer>
      <FloatingAIButton onClick={() => navigate(ROUTES.aiDoctor)} />
    </div>
  );
}

export { PublicLayout };
