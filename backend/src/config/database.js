// database.js - Cau hinh ket noi MongoDB (Mongoose)

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME || 'plantify_db',
    });
    console.log(`[MongoDB] Da ket noi thanh cong: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Loi ket noi: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
