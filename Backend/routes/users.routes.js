const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
// Giả sử bạn có middleware để kiểm tra token và vai trò admin
// const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// GET /api/users -> Lấy tất cả user (có thể tìm kiếm)
// Thêm middleware verifyToken, isAdmin để bảo vệ endpoint này
router.get('/', userController.getAllUsers);

// PATCH /api/users/:uuid -> Cập nhật thông tin user (ví dụ: role)
router.patch('/:uuid', userController.updateUser);

// DELETE /api/users/:uuid -> Xóa một user
router.delete('/:uuid', userController.deleteUser);

module.exports = router;