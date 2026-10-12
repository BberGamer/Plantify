// app.js - Khoi tao Express app

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Plantify API dang hoat dong binh thuong' });
});

// Cac routes cua features se duoc mount o day
// app.use('/api/v1/auth', require('./features/auth/auth.routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint khong ton tai' });
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Loi he thong',
  });
});

module.exports = app;