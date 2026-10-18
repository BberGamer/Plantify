// routes/auth.routes.js - Dinh nghia cac Endpoint API cho Module Auth
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// === DANG KY TAI KHOAN CO OTP ===
router.post("/register/send-otp", authController.sendRegisterOTP);
router.post("/register/verify-otp", authController.verifyRegisterOTP);

// === DANG NHAP & DANG XUAT ===
router.post("/login", authController.login);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getMe);

// === QUEN & DAT LAI MAT KHAU BANG OTP ===
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
