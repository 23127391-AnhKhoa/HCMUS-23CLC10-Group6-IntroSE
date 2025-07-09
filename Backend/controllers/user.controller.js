const UserService = require('../services/user.Service');

const getAllUsers = async (req, res) => {
    try {
        // Lấy tham số `search` từ query string để tìm kiếm
        const { search } = req.query;
        const result = await UserService.fetchAllUsers(search);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { uuid } = req.params;
        const updateData = req.body; // Dữ liệu cần cập nhật, vd: { role: 'Seller' }
        
        const result = await UserService.updateUserByUuid(uuid, updateData);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { uuid } = req.params;
        const result = await UserService.deleteUserByUuid(uuid);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    updateUser,
    deleteUser,
};