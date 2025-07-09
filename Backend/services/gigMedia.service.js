// backend/services/gigMedia.service.js
const GigMediaModel = require('../models/gigMedia.model');

class GigMediaService {
    /**
     * Get all media for a specific gig
     * @param {string} gigId - The gig ID
     * @returns {Promise<Array>} Array of media objects
     */
    static async getGigMedia(gigId) {
        try {
            if (!gigId) {
                throw new Error('Gig ID is required');
            }

            const media = await GigMediaModel.getByGigId(gigId);
            return media;
        } catch (error) {
            console.error('Service error - getting gig media:', error);
            throw error;
        }
    }

    /**
     * Create a new media entry for a gig
     * @param {Object} mediaData - The media data
     * @returns {Promise<Object>} The created media object
     */
    static async createGigMedia(mediaData) {
        try {
            // Validate required fields
            if (!mediaData.gig_id) {
                throw new Error('Gig ID is required');
            }
            if (!mediaData.url) {
                throw new Error('Media URL is required');
            }

            // Set default media type if not provided
            if (!mediaData.media_type) {
                mediaData.media_type = 'image';
            }

            const newMedia = await GigMediaModel.create(mediaData);
            return newMedia;
        } catch (error) {
            console.error('Service error - creating gig media:', error);
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
    static async updateGigMedia(id, gigId, updateData) {
        try {
            if (!id || !gigId) {
                throw new Error('Media ID and Gig ID are required');
            }

            const updatedMedia = await GigMediaModel.update(id, gigId, updateData);
            return updatedMedia;
        } catch (error) {
            console.error('Service error - updating gig media:', error);
            throw error;
        }
    }

    /**
     * Delete a media entry
     * @param {number} id - The media ID
     * @param {string} gigId - The gig ID
     * @returns {Promise<boolean>} Success status
     */
    static async deleteGigMedia(id, gigId) {
        try {
            if (!id || !gigId) {
                throw new Error('Media ID and Gig ID are required');
            }

            const result = await GigMediaModel.delete(id, gigId);
            return result;
        } catch (error) {
            console.error('Service error - deleting gig media:', error);
            throw error;
        }
    }

    /**
     * Delete all media for a specific gig
     * @param {string} gigId - The gig ID
     * @returns {Promise<boolean>} Success status
     */
    static async deleteAllGigMedia(gigId) {
        try {
            if (!gigId) {
                throw new Error('Gig ID is required');
            }

            const result = await GigMediaModel.deleteByGigId(gigId);
            return result;
        } catch (error) {
            console.error('Service error - deleting all gig media:', error);
            throw error;
        }
    }
}

module.exports = GigMediaService;
