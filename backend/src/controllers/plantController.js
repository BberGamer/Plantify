const Plant = require('../models/Plant');

const getPlants = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { scientificName: { $regex: req.query.keyword, $options: 'i' } },
          ],
        }
      : {};

    const categoryFilter = req.query.category ? { category: req.query.category } : {};
    const difficultyFilter = req.query.difficulty ? { difficulty: req.query.difficulty } : {};
    const featuredFilter = req.query.featured === 'true' ? { featured: true } : {};

    const filters = { ...keyword, ...categoryFilter, ...difficultyFilter, ...featuredFilter };

    const count = await Plant.countDocuments(filters);
    const plants = await Plant.find(filters)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ plants, page, pages: Math.ceil(count / pageSize), total: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPlantById = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (plant) {
      res.json(plant);
    } else {
      res.status(404).json({ message: 'Plant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPlant = async (req, res) => {
  try {
    const plant = new Plant({
      ...req.body,
      user: req.user._id,
    });
    const createdPlant = await plant.save();
    res.status(201).json(createdPlant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePlant = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (plant) {
      Object.assign(plant, req.body);
      const updatedPlant = await plant.save();
      res.json(updatedPlant);
    } else {
      res.status(404).json({ message: 'Plant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePlant = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (plant) {
      await plant.deleteOne();
      res.json({ message: 'Plant removed' });
    } else {
      res.status(404).json({ message: 'Plant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Plant.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { category: '$_id', count: 1, _id: 0 } }
    ]);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPlants,
  getPlantById,
  createPlant,
  updatePlant,
  deletePlant,
  getCategories,
};
