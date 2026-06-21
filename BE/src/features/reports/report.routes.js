// report.routes.js - Dinh nghia route cho bao cao bai viet Plantify
const express = require('express');
const reportController = require('./report.controller');
const { authenticate, authorizeCustomer } = require('../../middlewares/auth');

const router = express.Router();

// POST /api/reports - Customer bao cao bai viet.
router.post('/', authenticate, authorizeCustomer, reportController.createReport);

module.exports = router;
