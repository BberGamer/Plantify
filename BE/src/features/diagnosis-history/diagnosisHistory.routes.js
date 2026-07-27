// diagnosisHistory.routes.js
// Khai báo các endpoint lịch sử chẩn đoán và middleware xác thực khách hàng.

const express = require('express');
const diagnosisHistoryController = require('./diagnosisHistory.controller');
const { authenticate, authorizeCustomer } = require('../../middlewares/auth');

const router = express.Router();

router.use(authenticate, authorizeCustomer);
router.get('/', diagnosisHistoryController.getMyDiagnosisHistories);
router.get('/:id', diagnosisHistoryController.getMyDiagnosisHistoryById);

module.exports = router;
