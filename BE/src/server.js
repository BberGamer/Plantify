// server.js - Entry point: khởi tạo Express app và lắng nghe port
const dns = require('dns');
// Khắc phục triệt để lỗi DNS ECONNREFUSED của mạng Việt Nam đối với MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const connectDB = require('./config/db');
const Post = require('./features/posts/post.model');
const authRoutes = require('./features/auth/auth.routes');
const productRoutes = require('./features/products/product.routes');
const plantRoutes = require('./features/plants/plant.routes');
const postRoutes = require('./features/posts/post.routes');
const reportRoutes = require('./features/reports/report.routes');
const commentRoutes = require('./features/comments/comment.routes');
const careGuideRoutes = require('./features/care-guides/careGuide.routes');
const plantDiseaseRoutes = require('./features/plant-diseases/plantDisease.routes');
const errorHandler = require('./middlewares/errorHandler');
const favoriteRoutes = require('./features/favorites/favorite.routes');
const weatherRoutes = require('./features/weather/weather.routes');
const aiRoutes = require('./features/ai/ai.routes');
const notificationRoutes = require('./features/notifications/notification.routes');
const cartRoutes = require('./features/cart/cart.routes');

const app = express();
const OLD_RESOLVED_POST_TTL_MS = 2 * 24 * 60 * 60 * 1000;

cron.schedule(
  '5 0 * * *',
  async () => {
    try {
      const cutoffDate = new Date(Date.now() - OLD_RESOLVED_POST_TTL_MS);
      const result = await Post.deleteMany({
        status: 'resolved',
        processedAt: { $ne: null, $lte: cutoffDate },
      });

      console.log(`[cron] Deleted ${result.deletedCount || 0} old resolved posts`);
    } catch (error) {
      console.error('[cron] Failed to delete old resolved posts:', error);
    }
  },
  {
    timezone: 'Asia/Ho_Chi_Minh',
  }
);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Test route
app.get('/', (req, res) => {
  res.send('Plantify API Running');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/care-guides', careGuideRoutes);
app.use('/api/plant-diseases', plantDiseaseRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cart', cartRoutes);

// Error Handler Middleware (sau tất cả các route)
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
