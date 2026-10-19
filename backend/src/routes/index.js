// routes/index.js - Dinh nghia va tong hop API endpoints
const express = require("express");
const router = express.Router();
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/admin/users", userRoutes);

module.exports = router;
