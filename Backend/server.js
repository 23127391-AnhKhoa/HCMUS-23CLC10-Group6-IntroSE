// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Tải các biến môi trường từ file .env
dotenv.config();

// Khởi tạo ứng dụng Express
const app = express();

// Sử dụng middleware
app.use(cors()); // Cho phép các domain khác gọi API
app.use(express.json()); // Cho phép server đọc được body của request dưới dạng JSON

// Import các routes
const authRoutes = require('./routes/auth.routes');

// Định nghĩa các route chính
// Mọi request đến /api/auth sẽ được xử lý bởi authRoutes
app.use('/api/auth', authRoutes);

// Route mặc định để kiểm tra server có hoạt động không
app.get('/', (req, res) => {
  res.send('Chào mừng đến với Backend API!');
});

// Lấy port từ biến môi trường hoặc dùng port 3000 mặc định
const PORT = process.env.PORT || 3000;

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
});