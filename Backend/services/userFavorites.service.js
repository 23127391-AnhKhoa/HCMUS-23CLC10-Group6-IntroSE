// services/userFavorites.service.js
const UserFavorites = require('../models/userFavorites.model');
const supabase = require('../config/supabaseClient');

class UserFavoritesService {
    // Thêm favorite với validation
    static async addFavorite(userId, gigId) {
        try {
            // Kiểm tra user và gig có tồn tại không
            await this.validateUserAndGig(userId, gigId);
            
            // Kiểm tra đã favorite chưa
            const alreadyFavorited = await UserFavorites.isFavorited(userId, gigId);
            if (alreadyFavorited) {
                throw new Error('Gig is already in favorites');
            }

            const result = await UserFavorites.addFavorite(userId, gigId);
            return result;
        } catch (error) {
            console.error('Error in addFavorite service:', error);
            throw error;
        }
    }

    // Xóa favorite
    static async removeFavorite(userId, gigId) {
        try {
            const result = await UserFavorites.removeFavorite(userId, gigId);
            return result;
        } catch (error) {
            console.error('Error in removeFavorite service:', error);
            throw error;
        }
    }

    // Lấy favorites của user với thông tin chi tiết
    static async getUserFavorites(userId) {
        try {
            const favorites = await UserFavorites.getUserFavorites(userId);
            
            // Lấy thêm thông tin về owner và category cho mỗi gig
            const enhancedFavorites = await Promise.all(
                favorites.map(async (favorite) => {
                    const gig = favorite.gig_id;
                    
                    // Lấy thông tin owner
                    const { data: owner } = await supabase
                        .from('User')
                        .select('uuid, fullname, username, avatar')
                        .eq('uuid', gig.owner_id)
                        .single();

                    // Lấy thông tin category
                    const { data: category } = await supabase
                        .from('Categories')
                        .select('id, name')
                        .eq('id', gig.category_id)
                        .single();

                    return {
                        ...favorite,
                        gig: {
                            ...gig,
                            owner: owner || null,
                            category: category || null
                        }
                    };
                })
            );

            return enhancedFavorites;
        } catch (error) {
            console.error('Error in getUserFavorites service:', error);
            throw error;
        }
    }

    // Toggle favorite
    static async toggleFavorite(userId, gigId) {
        try {
            await this.validateUserAndGig(userId, gigId);
            const result = await UserFavorites.toggleFavorite(userId, gigId);
            return result;
        } catch (error) {
            console.error('Error in toggleFavorite service:', error);
            throw error;
        }
    }

    // Kiểm tra favorite status
    static async checkFavoriteStatus(userId, gigId) {
        try {
            const isFavorited = await UserFavorites.isFavorited(userId, gigId);
            return { isFavorited };
        } catch (error) {
            console.error('Error in checkFavoriteStatus service:', error);
            throw error;
        }
    }

    // Validate user và gig có tồn tại
    static async validateUserAndGig(userId, gigId) {
        try {
            // Kiểm tra user
            const { data: user, error: userError } = await supabase
                .from('User')
                .select('uuid')
                .eq('uuid', userId)
                .single();

            if (userError || !user) {
                throw new Error('User not found');
            }

            // Kiểm tra gig
            const { data: gig, error: gigError } = await supabase
                .from('Gigs')
                .select('id')
                .eq('id', gigId)
                .single();

            if (gigError || !gig) {
                throw new Error('Gig not found');
            }

            return true;
        } catch (error) {
            console.error('Error in validateUserAndGig:', error);
            throw error;
        }
    }
}

module.exports = UserFavoritesService;
