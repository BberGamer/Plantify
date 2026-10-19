// routes/user.routes.js - Dinh nghia cac Endpoint API cho Module User Management
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticate, authorizeAdmin } = require("../middlewares/auth.middleware");

// Tat ca cac route quan ly nguoi dung cua Admin deu yeu cau dang nhap va quyen Admin
router.use(authenticate, authorizeAdmin);

/**
 * @route   GET /api/v1/users
 * @desc    Lay danh sach nguoi dung (phan trang, tim kiem, loc) cho Admin
 * @access  Private (Admin)
 */
router.get("/", userController.getUsers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Lay chi tiet nguoi dung theo ID
 * @access  Private (Admin)
 */
router.get("/:id", userController.getUserById);

module.exports = router;
