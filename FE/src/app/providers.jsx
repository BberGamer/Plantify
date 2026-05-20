import { jsx, jsxs } from "react/jsx-runtime";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
function ThemeProvider({ children }) {
  return /* @__PURE__ */ jsx(
    NextThemesProvider,
    {
      attribute: "class",
      defaultTheme: "light",
      enableSystem: true,
      disableTransitionOnChange: true,
      children
    }
  );
}
function AppProviders({ children }) {
  return /* @__PURE__ */ jsx(ThemeProvider, { children: /* @__PURE__ */ jsxs(TooltipProvider, { children: [
    children,
    /* @__PURE__ */ jsx(Toaster, { richColors: true, position: "top-center" })
  ] }) });
}
export {
  AppProviders
};
