// app.js - Khoi tao ung dung Express va cau hinh middlewares/routes
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

// === PHAN 1: Middlewares co ban ===
app.use(cors());
app.use(
  "/uploads/plants",
  express.static(
    require("./middlewares/garden-upload.middleware").uploadDirectory,
    {
      dotfiles: "deny",
      index: false,
      setHeaders: (res) => res.set("X-Content-Type-Options", "nosniff"),
    },
  ),
);
// Webhook phải nhận bytes gốc trước express.json để xác minh HMAC.
app.post(
  [
    "/api/v1/commerce/payment/webhook/sepay",
    "/api/commerce/payment/webhook/sepay",
  ],
  express.raw({ type: "application/json", limit: "64kb" }),
  require("./controllers/finance.controller").webhook,
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// === PHAN 2: Health check ===
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Plantify API đang hoạt động bình thường",
  });
});

// === PHAN 3: Dang ky Routes cho cac Modules ===
// Giữ tương thích client đang dùng /api và client dùng prefix /api/v1.
app.use(["/api/v1", "/api"], require("./routes/index.route"));

// === PHAN 4: 404 Handler ===
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint không tồn tại trên hệ thống",
    data: null,
  });
});

// === PHAN 5: Global Error Handler ===
app.use(errorHandler);

module.exports = app;
