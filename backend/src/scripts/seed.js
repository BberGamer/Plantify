const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Plant = require('../models/Plant');
const plantsSeed = require('../data/plantsSeed.json');
const connectDB = require('../config/db');

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await Plant.deleteMany();
    await User.deleteMany();

    const createdUsers = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
      },
      {
        name: 'Regular User',
        email: 'user@example.com',
        password: 'password123',
        role: 'user',
      },
    ]);

    const adminUser = createdUsers[0]._id;

    const samplePlants = plantsSeed.map((plant) => {
      return { ...plant, user: adminUser };
    });

    await Plant.insertMany(samplePlants);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Plant.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
