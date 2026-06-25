// report.routes.js - Dinh nghia route cho bao cao bai viet Plantify
const express = require('express');
const reportController = require('./report.controller');
const { authenticate, authorizeContentManager, authorizeCustomer } = require('../../middlewares/auth');

const router = express.Router();

// GET /api/reports - Content Manager lay danh sach bao cao.
router.get('/', authenticate, authorizeContentManager, reportController.getAllReports);

// POST /api/reports - Customer bao cao bai viet.
router.post('/', authenticate, authorizeCustomer, reportController.createReport);

// PATCH /api/reports/:id/process - Content Manager xu ly bao cao.
router.patch('/:id/process', authenticate, authorizeContentManager, reportController.processReport);

module.exports = router;
