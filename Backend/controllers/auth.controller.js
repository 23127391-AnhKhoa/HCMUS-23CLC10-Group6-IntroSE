// controllers/auth.controller.js
const User = require('../models/user.model');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Kiểm tra xem username và password có được gửi lên không
    if (!username || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập Username và Password.' });
    }

    // 2. Tìm user trong database bằng model
    const user = await User.findByUsername(username);

    // 3. Kiểm tra user có tồn tại không
    if (!user) {
      return res.status(404).json({ message: 'Username không tồn tại.' });
    }

    // 4. Kiểm tra mật khẩu (demo đơn giản, không an toàn)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Sai mật khẩu.' });
    }
    
    // 5. Nếu thành công, trả về thông tin user (trừ mật khẩu)
    const { password: _, ...userInfo } = user; // Loại bỏ mật khẩu khỏi object trả về
    res.status(200).json({ 
      message: 'Đăng nhập thành công!',
      data: userInfo 
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

module.exports = {
  login,
};