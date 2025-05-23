
require('dotenv').config();
const express = require('express');
const path = require('path'); // Module để làm việc với đường dẫn file

// Khởi tạo ứng dụng Express
const app = express();


const PORT = process.env.PORT || 3000;



// Sử dụng middleware express.static để phục vụ các file từ thư mục đã chỉ định
app.use(express.static(staticFilesPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(staticFilesPath, 'index.html'));
});

// Khởi động server và lắng nghe trên PORT đã định nghĩa
app.listen(PORT, () => {
  console.log(`Static server Freeland đang lắng nghe trên cổng ${PORT}`);
  console.log(`Phục vụ file từ thư mục: ${staticFilesPath}`);
  console.log(`Truy cập tại: http://localhost:${PORT}`);
});