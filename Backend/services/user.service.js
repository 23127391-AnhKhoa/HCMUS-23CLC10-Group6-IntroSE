const User = require('../models/user.model');
const supabase = require('../config/supabaseClient');

// Từ nhánh HEAD
const fetchAllUsers = async (searchTerm) => {
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

    const data = await User.updateByUuid(uuid, finalUpdateData);
    return data;
};

const deleteUserByUuid = async (uuid) => {
    // Dữ liệu cần cập nhật
    const dataToUpdate = { status: 'inactive' };

    // Gọi hàm update có sẵn trong model của bạn
    const updatedUser = await User.updateByUuid(uuid, dataToUpdate);

    // Không còn xóa user khỏi Supabase Auth nữa
    // Việc này giữ lại tài khoản để họ có thể đăng nhập nếu cần kích hoạt lại

    return { 
        message: `User ${uuid} has been deactivated.`,
        user: updatedUser 
    };
};

// Từ nhánh kia
const getUserById = async (userId) => {
    try {
        const { data: user, error } = await supabase
            .from('User')
            .select(`
                uuid,
                fullname,
                username,
                avt_url,
                balance,
                created_at,
                updated_at,
                role,
                status,
                seller_headline,
                seller_description,
                seller_since
            `)
            .eq('uuid', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (!user) return null;

        return {
            id: user.uuid,
            fullname: user.fullname,
            username: user.username,
            avatar: user.avt_url || 'https://placehold.co/300x300',
            balance: user.balance,
            created_at: user.created_at,
            updated_at: user.updated_at,
            role: user.role,
            status: user.status,
            seller_headline: user.seller_headline,
            seller_description: user.seller_description,
            seller_since: user.seller_since
        };
    } catch (error) {
        throw new Error(`Error fetching user: ${error.message}`);
    }
};

const getUserByUsername = async (username) => {
    try {
        const { data: user, error } = await supabase
            .from('User')
            .select(`
                uuid,
                fullname,
                username,
                avt_url,
                balance,
                created_at,
                updated_at,
                role,
                status,
                seller_headline,
                seller_description,
                seller_since
            `)
            .eq('username', username)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (!user) return null;

        return {
            id: user.uuid,
            fullname: user.fullname,
            username: user.username,
            avatar: user.avt_url || 'https://placehold.co/300x300',
            balance: user.balance,
            created_at: user.created_at,
            updated_at: user.updated_at,
            role: user.role,
            status: user.status,
            seller_headline: user.seller_headline,
            seller_description: user.seller_description,
            seller_since: user.seller_since
        };
    } catch (error) {
        throw new Error(`Error fetching user: ${error.message}`);
    }
};

// Export tất cả
module.exports = {
    fetchAllUsers,
    updateUserByUuid,
    deleteUserByUuid,
    getUserById,
    getUserByUsername
};
