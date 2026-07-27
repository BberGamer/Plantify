const express = require('express');
const diagnosisHistoryController = require('./diagnosisHistory.controller');
const { authenticate, authorizeCustomer } = require('../../middlewares/auth');

const router = express.Router();

router.use(authenticate, authorizeCustomer);
router.get('/', diagnosisHistoryController.getMyDiagnosisHistories);
router.get('/:id', diagnosisHistoryController.getMyDiagnosisHistoryById);

module.exports = router;
