// routes/plant.routes.js - Dinh nghia endpoints cho Plants module
const express = require('express');
const router = express.Router();
const { getCategories, getPlants, getPlantById, getManagerPlants, createPlant, updatePlant, deletePlant } = require('../controllers/plant.controller');
const { authenticate, authorizeManager } = require('../middlewares/auth.middleware');

router.use('/manager', authenticate, authorizeManager);
router.get('/manager', getManagerPlants);
router.post('/manager', createPlant);
router.put('/manager/:id', updatePlant);
router.delete('/manager/:id', deletePlant);

// GET /api/plants/categories  → danh sach danh muc
router.get('/categories', getCategories);

// GET /api/plants             → danh sach cay (filter, search, phan trang)
router.get('/', getPlants);

// GET /api/plants/:id         → chi tiet cay
router.get('/:id', getPlantById);

module.exports = router;
