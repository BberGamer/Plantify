// main.jsx
// Entry: mount React, router và providers toàn app
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "@/app/router";
import { AppProviders } from "@/app/providers";
import "@/styles/index.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element #root not found");
}

createRoot(root).render(
  <AppProviders>
    <RouterProvider router={router} />
  </AppProviders>,
);
