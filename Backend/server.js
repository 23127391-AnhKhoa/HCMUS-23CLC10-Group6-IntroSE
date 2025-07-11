// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Tải các biến môi trường từ file .env
//dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();
// Khởi tạo ứng dụng Express
const app = express();

// Sử dụng middleware
app.use(cors()); // Cho phép các domain khác gọi API
app.use(express.json()); // Cho phép server đọc được body của request dưới dạng JSON

/////////////////////////////////////////////////////////////
// --- IMPORT ROUTES ---
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const gigRoutes = require('./routes/gigs.routes');
const orderRoutes = require('./routes/orders.routes');
const transactionRoutes = require('./routes/transactions.routes');
const adminRoutes = require('./routes/admin.routes');
const uploadRoutes = require('./routes/upload.routes');

// Định nghĩa các route chính
// Mọi request đến /api/auth sẽ được xử lý bởi authRoutes

// --- USE ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
//app.use('/api/gigs', gigRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/upload', uploadRoutes);

//app.use('/api/admin', adminRoutes);
// Xài cái api thì nhớ bỏ // ở đầu, ví dụ xài gigs thì bỏ //, tại bây giờ chưa định nghĩa mà để dô thì nó không được hiểu là function, nó sẽ bị lỗi

////////////////////////////////////////////////////////////

// Lấy port từ biến môi trường hoặc dùng port 3000 mặc định
const PORT = process.env.PORT || 3000;

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server is running ${PORT}`);
});