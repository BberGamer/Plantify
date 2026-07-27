// userPlant.routes.js - Định nghĩa API CRUD /api/my-garden
const express = require('express');
const { authenticate } = require('../../middlewares/auth');
const userPlantController = require('./userPlant.controller');

const router = express.Router();

// Toàn bộ My Garden yêu cầu JWT hợp lệ.
router.use(authenticate);
router.post('/', userPlantController.createUserPlant);
router.get('/', userPlantController.getMyUserPlants);
router.get('/:id', userPlantController.getMyUserPlantById);
router.patch('/:id', userPlantController.updateMyUserPlant);
router.delete('/:id', userPlantController.archiveMyUserPlant);

module.exports = router;
