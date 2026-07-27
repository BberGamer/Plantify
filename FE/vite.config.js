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
 * Trình duyệt đóng kết nối SSE khi refresh/unmount bằng cách reset socket.
 * Vite nhận reset trước khi trạng thái `request.aborted` luôn kịp cập nhật, vì vậy
 * nhận diện theo đúng endpoint và mã lỗi thay vì phụ thuộc vào thời điểm của socket.
 * Các lỗi proxy khác vẫn được ghi đầy đủ.
 */
viteLogger.error = (message, options) => {
  const isExpectedNotificationStreamReset = (
    String(message).includes("http proxy error: /api/notifications/events")
    && options?.error?.code === "ECONNRESET"
  );

  if (
    isExpectedNotificationStreamReset
    || options?.error?.plantifyExpectedClientAbort
  ) {
    return;
  }

  logViteError(message, options);
};

function configureApiProxy(proxy) {
  proxy.on("error", (error, request) => {
    const isNotificationStream = request?.url?.includes("/notifications/events");

    if (
      isNotificationStream
      && error?.code === "ECONNRESET"
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
        timeout: 0,
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
