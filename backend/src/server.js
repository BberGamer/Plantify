// server.js - Entry point cua he thong

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const connectDB = require('./config/database');
const app = require('./app');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  void require("./services/notificationWorker").start().catch((error) =>
    console.error("[Notifications] Không khởi động được tác vụ nhắc lịch.", error.code || error.name));
  const expireVip = () => require("./models/user.model").updateMany(
    { isproaccount: true, vip_expires_at: { $lte: new Date() } },
    { $set: { isproaccount: false } },
  ).catch(() => console.error("[VIP] Không đồng bộ được trạng thái hết hạn."));
  await expireVip();
  setInterval(expireVip, 60000).unref();
  app.listen(PORT, () => {
    console.log(`[Server] Plantify API dang chay tai port ${PORT}`);
    console.log(`[Server] Moi truong: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();
