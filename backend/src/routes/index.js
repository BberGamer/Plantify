// routes/index.js - Dinh nghia va tong hop API endpoints
const express = require("express");
const router = express.Router();
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const plantRoutes = require("./plant.routes");
const diseaseRoutes = require("./disease.routes");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/admin/users", userRoutes);
router.use("/plants", plantRoutes);
router.use("/diseases", diseaseRoutes);
router.use("/garden/plants", require("./garden.routes"));
router.use("/chat", require("./chat.routes"));

module.exports = router;
