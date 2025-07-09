// services/user.Service.js
const User = require('../models/user.model');
const supabase = require('../config/supabaseClient'); 

const fetchAllUsers = async (searchTerm) => {
    // Gọi hàm findAll vừa bổ sung trong model
    const data = await User.findAll(searchTerm);
    
    return data;
};

const updateUserByUuid = async (uuid, updateData) => {
    const allowedUpdates = ['role', 'status'];
    const finalUpdateData = {};
    for (const key of allowedUpdates) {
        if (updateData[key]) {
            finalUpdateData[key] = updateData[key];
        }
    }

    if (Object.keys(finalUpdateData).length === 0) {
        throw new Error("No valid fields to update.");
    }
    
    // THAY ĐỔI Ở ĐÂY: Gọi hàm updateByUuid từ model của bạn
    const data = await User.updateByUuid(uuid, finalUpdateData);
    return data;
};

const deleteUserByUuid = async (uuid) => {
    // Xóa profile bằng hàm remove vừa bổ sung
    await User.remove(uuid);

    // Xóa user khỏi Supabase Auth (giữ nguyên)
    const { error: authError } = await supabase.auth.admin.deleteUser(uuid);
    if (authError) {
        console.error("Failed to delete auth user:", authError.message);
    }

    return { message: `User ${uuid} deleted successfully.` };
};

module.exports = {
    fetchAllUsers,
    updateUserByUuid,
    deleteUserByUuid,
};