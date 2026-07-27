// userPlant.routes.js - Định nghĩa API CRUD /api/my-garden
const express = require('express');
const { authenticate } = require('../../middlewares/auth');
const userPlantController = require('./userPlant.controller');
const { uploadUserPlantImage } = require('./userPlant.upload');
const careEventController = require('./careEvent.controller');

const router = express.Router();

// Toàn bộ My Garden yêu cầu JWT hợp lệ.
router.use(authenticate);
router.post('/', userPlantController.createUserPlant);
router.get('/', userPlantController.getMyUserPlants);
router.post('/:id/care-events', careEventController.create);
router.get('/:id/care-events', careEventController.list);
router.patch('/:id/care-events/:eventId', careEventController.update);
router.delete('/:id/care-events/:eventId', careEventController.remove);
router.post('/:id/images', uploadUserPlantImage, userPlantController.uploadUserPlantImage);
router.patch('/:id/images/:imageId', userPlantController.updateUserPlantImage);
router.delete('/:id/images/:imageId', userPlantController.deleteUserPlantImage);
router.get('/:id', userPlantController.getMyUserPlantById);
router.patch('/:id', userPlantController.updateMyUserPlant);
router.delete('/:id', userPlantController.archiveMyUserPlant);

module.exports = router;
