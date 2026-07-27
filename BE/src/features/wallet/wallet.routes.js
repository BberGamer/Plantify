// wallet.routes.js
// Khai báo endpoint ví người dùng và middleware xác thực khách hàng liên quan.

const express = require('express');
const { authenticate, authorizeCustomer } = require('../../middlewares/auth');
const walletController = require('./wallet.controller');

const router = express.Router();
router.get('/', authenticate, authorizeCustomer, walletController.getMyWallet);

module.exports = router;
