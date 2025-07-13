// models/userFavorites.model.js
const supabase = require('../config/supabaseClient');

class UserFavorites {
    // Thêm gig vào favorites
    static async addFavorite(userId, gigId) {
        try {
            const { data, error } = await supabase
                .from('UserFavorites')
                .insert([
                    {
                        user_id: userId,
                        gig_id: gigId,
                        created_at: new Date().toISOString()
                    }
                ])
                .select();

            if (error) {
                console.error('Error adding favorite:', error);
                throw error;
            }

            return data[0];
        } catch (error) {
            console.error('Error in addFavorite:', error);
            throw error;
        }
    }

    // Xóa gig khỏi favorites
    static async removeFavorite(userId, gigId) {
        try {
            const { data, error } = await supabase
                .from('UserFavorites')
                .delete()
                .eq('user_id', userId)
                .eq('gig_id', gigId)
                .select();

            if (error) {
                console.error('Error removing favorite:', error);
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error in removeFavorite:', error);
            throw error;
        }
    }

    // Lấy tất cả favorites của user
    static async getUserFavorites(userId) {
        try {
            const { data, error } = await supabase
                .from('UserFavorites')
                .select(`
                    *,
                    Gigs!UserFavorites_gig_id_fkey (
                        id,
                        title,
                        description,
                        price,
                        cover_image,
                        category_id,
                        owner_id,
                        created_at,
                        updated_at
                    )
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error getting user favorites:', error);
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error in getUserFavorites:', error);
            throw error;
        }
    }

    // Kiểm tra xem gig có được favorite hay không
    static async isFavorited(userId, gigId) {
        try {
            const { data, error } = await supabase
                .from('UserFavorites')
                .select('*')
                .eq('user_id', userId)
                .eq('gig_id', gigId)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
                console.error('Error checking favorite status:', error);
                throw error;
            }

            return !!data;
        } catch (error) {
            console.error('Error in isFavorited:', error);
            throw error;
        }
    }

    // Toggle favorite status
    static async toggleFavorite(userId, gigId) {
        try {
            const isFav = await this.isFavorited(userId, gigId);
            
            if (isFav) {
                await this.removeFavorite(userId, gigId);
                return { action: 'removed', isFavorited: false };
            } else {
                await this.addFavorite(userId, gigId);
                return { action: 'added', isFavorited: true };
            }
        } catch (error) {
            console.error('Error in toggleFavorite:', error);
            throw error;
        }
    }
}

module.exports = UserFavorites;
