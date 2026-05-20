import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

function ThemeProvider({ children }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <TooltipProvider>
        {children}
        <Toaster richColors position="top-center" />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export { AppProviders };
