// product.routes.js - Định nghĩa các route cho Products
const express = require('express');
const router = express.Router();
const productController = require('./product.controller');
const { authenticate } = require('../../middlewares/auth');

router.get('/', productController.getAllProducts);
router.get('/categories', productController.getAllCategories);
router.post('/categories', authenticate, productController.createCategory);
router.put('/categories/:id', authenticate, productController.updateCategory);
router.delete('/categories/:id', authenticate, productController.deleteCategory);
router.get('/:id', productController.getProductById);
router.post('/', authenticate, productController.createProduct);
router.put('/:id', authenticate, productController.updateProduct);
router.delete('/:id', authenticate, productController.deleteProduct);

module.exports = router;

