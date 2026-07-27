// vite.config.js
// Cấu hình Vite: React, Tailwind, alias @, proxy API
import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { createLogger, defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const viteLogger = createLogger();
const logViteError = viteLogger.error.bind(viteLogger);

/**
 * Chỉ bỏ log ECONNRESET khi chính client đã đóng SSE; lỗi proxy thật vẫn được log.
 */
viteLogger.error = (message, options) => {
  if (options?.error?.plantifyExpectedClientAbort) return;
  logViteError(message, options);
};

function configureApiProxy(proxy) {
  proxy.on("error", (error, request, response) => {
    const isNotificationStream = request?.url?.includes("/notifications/events");
    const clientAlreadyClosed = request?.aborted
      || response?.destroyed
      || response?.writableEnded;

    if (
      isNotificationStream
      && error?.code === "ECONNRESET"
      && clientAlreadyClosed
    ) {
      error.plantifyExpectedClientAbort = true;
    }
  });
}

export default defineConfig({
  customLogger: viteLogger,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        proxyTimeout: 0,
        configure: configureApiProxy,
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  assetsInclude: ["**/*.svg", "**/*.csv"],
});
