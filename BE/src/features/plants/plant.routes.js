// plant.routes.js - Định nghĩa các route cho Plants
const express = require('express');
const plantController = require('./plant.controller');

const router = express.Router();

// GET /api/plants - Lấy danh sách cây.
router.get('/', plantController.getAllPlants);

module.exports = router;
