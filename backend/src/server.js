// server.js - Entry point cua he thong

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const connectDB = require('./config/database');
const app = require('./app');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Server] Plantify API dang chay tai port ${PORT}`);
    console.log(`[Server] Moi truong: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();