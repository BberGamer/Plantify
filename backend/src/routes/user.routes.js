// routes/user.routes.js - Dinh nghia cac Endpoint API cho Module User Management
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticate, authorizeAdmin } = require("../middlewares/auth.middleware");

// Tat ca cac route quan ly nguoi dung cua Admin deu yeu cau dang nhap va quyen Admin
router.use(authenticate, authorizeAdmin);
router.post("/", userController.createUser);

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

/**
 * @route   PUT /api/v1/users/:id  (or PATCH)
 * @desc    1. Update user info & status (Active / Banned)
 * @access  Private (Admin)
 */
router.put("/:id", userController.updateUser);
router.patch("/:id", userController.updateUser);

/**
 * @route   PATCH /api/v1/users/:id/status
 * @desc    2. Deactivate / Ban user account (status: true / false)
 * @access  Private (Admin)
 */
router.patch("/:id/status", userController.updateUserStatus);

/**
 * @route   PATCH /api/v1/users/:id/role
 * @desc    3. Manage System Roles (assign role: Customer / Manager / Admin)
 * @access  Private (Admin)
 */
router.patch("/:id/role", userController.updateUserRole);

module.exports = router;
