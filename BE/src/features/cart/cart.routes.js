// cart.routes.js - Dinh nghia cac route cho Cart
const express = require('express');
const router = express.Router();
const cartController = require('./cart.controller');
const { authenticate, authorizeCustomer } = require('../../middlewares/auth');

router.use(authenticate, authorizeCustomer);

router.get('/', cartController.getMyCart);
router.post('/items', cartController.addCartItem);
router.post('/merge', cartController.mergeCart);
router.patch('/items/:productId', cartController.updateCartItem);
router.delete('/items/selected', cartController.removeSelectedItems);
router.delete('/items/:productId', cartController.removeCartItem);

module.exports = router;
