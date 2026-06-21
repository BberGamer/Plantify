// server.js - Entry point: khởi tạo Express app và lắng nghe port
const dns = require('dns');
// Khắc phục triệt để lỗi DNS ECONNREFUSED của mạng Việt Nam đối với MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./features/auth/auth.routes');
const productRoutes = require('./features/products/product.routes');
const plantRoutes = require('./features/plants/plant.routes');
const postRoutes = require('./features/posts/post.routes');
const commentRoutes = require('./features/comments/comment.routes');
const careGuideRoutes = require('./features/care-guides/careGuide.routes');
const plantDiseaseRoutes = require('./features/plant-diseases/plantDisease.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

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
app.use('/api/comments', commentRoutes);
app.use('/api/care-guides', careGuideRoutes);
app.use('/api/plant-diseases', plantDiseaseRoutes);

// Error Handler Middleware (sau tất cả các route)
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
