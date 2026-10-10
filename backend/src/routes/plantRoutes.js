const express = require('express');
const router = express.Router();
const {
  getPlants,
  getPlantById,
  createPlant,
  updatePlant,
  deletePlant,
  getCategories,
} = require('../controllers/plantController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getPlants).post(protect, admin, createPlant);
router.route('/categories').get(getCategories);
router.route('/:id').get(getPlantById).put(protect, admin, updatePlant).delete(protect, admin, deletePlant);

module.exports = router;
