// server.js

// Import các module cần thiết
require('dotenv').config();
const express = require('express');
const path = require('path'); // QUAN TRỌNG: Cần import module 'path'

// Khởi tạo ứng dụng Express
const app = express();

// Lấy PORT từ biến môi trường hoặc sử dụng 3000 làm mặc định
const PORT = process.env.PORT || 3000;

// =================================================================
// KHAI BÁO BIẾN staticFilesPath Ở ĐÂY - TRƯỚC KHI SỬ DỤNG
// =================================================================
// __dirname là đường dẫn đến thư mục chứa file server.js hiện tại.
// path.join sẽ tạo ra một đường dẫn đúng cách, bất kể hệ điều hành.
// Thay 'public' bằng tên thư mục thực tế chứa các file tĩnh của bạn nếu nó khác.
const staticFilesPath = path.join(__dirname, 'public');
// =================================================================

// Sử dụng middleware express.static để phục vụ các file từ thư mục đã chỉ định
// Dòng này (hoặc tương tự) là dòng 15 gây lỗi trong log của bạn
app.use(express.static(staticFilesPath));

// Route để phục vụ file index.html cho tất cả các đường dẫn không khớp
app.get('*', (req, res) => {
  // Khi sử dụng lại staticFilesPath ở đây, nó cũng phải đã được khai báo ở trên
  res.sendFile(path.join(staticFilesPath, 'index.html'));
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Static server Freeland đang lắng nghe trên cổng ${PORT}`);
  // Khi sử dụng lại staticFilesPath ở đây, nó cũng phải đã được khai báo ở trên
  console.log(`Phục vụ file từ thư mục: ${staticFilesPath}`);
  console.log(`Truy cập tại: http://localhost:${PORT}`); // Chỉ hữu ích khi chạy local
});