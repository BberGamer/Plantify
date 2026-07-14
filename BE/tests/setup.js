// tests/setup.js - Khởi tạo môi trường test trước khi Jest chạy test
// Mock biến môi trường cần thiết cho toàn bộ test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '7d';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'test-password';
process.env.MONGO_URI = 'mongodb://localhost:27017/plantify_test';
process.env.VNPAY_TMN_CODE = 'TEST_TMN_CODE';
process.env.VNPAY_HASH_SECRET = 'TEST_HASH_SECRET';
process.env.VNPAY_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
process.env.VNPAY_RETURN_URL = 'http://localhost:3000/payment/return';
process.env.AI_PROVIDER = 'groq';
process.env.GROQ_API_KEY = 'test-groq-api-key';
process.env.OPENWEATHER_API_KEY = 'test-openweather-api-key';
process.env.OPENROUTER_API_KEY = 'test-openrouter-api-key';
process.env.OPENROUTER_MODEL = 'openai/gpt-4o';
process.env.OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

