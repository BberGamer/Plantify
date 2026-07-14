// product.routes.js - Định nghĩa các route cho Products
const express = require('express');
const router = express.Router();
const productController = require('./product.controller');
const { authenticate, authorizeBusinessManager } = require('../../middlewares/auth');

router.get('/', productController.getAllProducts);
router.get('/categories', productController.getAllCategories);
router.post('/categories', authenticate, authorizeBusinessManager, productController.createCategory);
router.put('/categories/:id', authenticate, authorizeBusinessManager, productController.updateCategory);
router.delete('/categories/:id', authenticate, authorizeBusinessManager, productController.deleteCategory);
router.get('/:id', productController.getProductById);
router.post('/', authenticate, authorizeBusinessManager, productController.createProduct);
router.put('/:id', authenticate, authorizeBusinessManager, productController.updateProduct);
router.delete('/:id', authenticate, authorizeBusinessManager, productController.deleteProduct);

module.exports = router;

