// backend/models/gigMedia.model.js
const supabase = require('../config/supabaseClient');

class GigMediaModel {
    /**
     * Get all media for a specific gig
     * @param {string} gigId - The gig ID
     * @returns {Promise<Array>} Array of media objects
     */
    static async getByGigId(gigId) {
        try {
            const { data, error } = await supabase
                .from('GigMedia')
                .select('*')
                .eq('gig_id', gigId)
                .order('id', { ascending: true });

            if (error) {
                throw error;
            }

            return data || [];
        } catch (error) {
            console.error('Error fetching gig media:', error);
            throw error;
        }
    }

    /**
     * Create a new media entry for a gig
     * @param {Object} mediaData - The media data
     * @param {string} mediaData.gig_id - The gig ID
     * @param {string} mediaData.media_type - The media type (e.g., 'image', 'video')
     * @param {string} mediaData.url - The media URL
     * @returns {Promise<Object>} The created media object
     */
    static async create(mediaData) {
        try {
            const { data, error } = await supabase
                .from('GigMedia')
                .insert([mediaData])
                .select()
                .single();

            if (error) {
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error creating gig media:', error);
            throw error;
        }
    }

    /**
     * Update a media entry
     * @param {number} id - The media ID
     * @param {string} gigId - The gig ID
     * @param {Object} updateData - The data to update
     * @returns {Promise<Object>} The updated media object
     */
    static async update(id, gigId, updateData) {
        try {
            const { data, error } = await supabase
                .from('GigMedia')
                .update(updateData)
                .eq('id', id)
                .eq('gig_id', gigId)
                .select()
                .single();

            if (error) {
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error updating gig media:', error);
            throw error;
        }
    }

    /**
     * Delete a media entry
     * @param {number} id - The media ID
     * @param {string} gigId - The gig ID
     * @returns {Promise<boolean>} Success status
     */
    static async delete(id, gigId) {
        try {
            const { error } = await supabase
                .from('GigMedia')
                .delete()
                .eq('id', id)
                .eq('gig_id', gigId);

            if (error) {
                throw error;
            }

            return true;
        } catch (error) {
            console.error('Error deleting gig media:', error);
            throw error;
        }
    }

    /**
     * Delete all media for a specific gig
     * @param {string} gigId - The gig ID
     * @returns {Promise<boolean>} Success status
     */
    static async deleteByGigId(gigId) {
        try {
            const { error } = await supabase
                .from('GigMedia')
                .delete()
                .eq('gig_id', gigId);

            if (error) {
                throw error;
            }

            return true;
        } catch (error) {
            console.error('Error deleting gig media:', error);
            throw error;
        }
    }
}

module.exports = GigMediaModel;
