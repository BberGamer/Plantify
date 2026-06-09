import { Leaf } from "lucide-react";

function Footer() {
  return (
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
  );
}

export { Footer };
