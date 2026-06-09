// product.routes.js - Định nghĩa các route cho Products
const express = require('express');
const router = express.Router();
const productController = require('./product.controller');

router.get('/:id', productController.getProductById);

module.exports = router;
