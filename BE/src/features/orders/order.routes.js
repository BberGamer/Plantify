// order.routes.js - Dinh nghia cac route cho Orders
const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const { authenticate, authorizeCustomer } = require('../../middlewares/auth');

router.use(authenticate, authorizeCustomer);

router.get('/me', orderController.getMyOrders);
router.post('/', orderController.createOrder);

module.exports = router;
