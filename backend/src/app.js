// app.js - Khoi tao ung dung Express va cau hinh middlewares/routes
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

// === PHAN 1: Middlewares co ban ===
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// === PHAN 2: Health check ===
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Plantify API dang hoat dong binh thuong" });
});

// === PHAN 3: Dang ky Routes cho cac Modules ===
app.use("/api", require("./routes"));

// === PHAN 4: 404 Handler ===
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint khong ton tai tren he thong",
    data: null,
  });
});

// === PHAN 5: Global Error Handler ===
app.use(errorHandler);

module.exports = app;