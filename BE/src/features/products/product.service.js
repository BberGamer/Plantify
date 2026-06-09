// product.service.js - Business logic cho Products
const Product = require('./product.model');

/**
 * Lấy product theo id, populate category
 * @param {string} id - Product id
 * @returns {Promise<Object>} Product object
 */
async function getProductById(id) {
  const product = await Product.findById(id).populate('categoryId');
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
}

module.exports = { getProductById };
