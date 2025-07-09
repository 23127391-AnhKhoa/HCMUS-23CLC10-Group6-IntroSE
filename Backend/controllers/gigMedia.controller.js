// backend/controllers/gigMedia.controller.js
const GigMediaService = require('../services/gigMedia.service');

class GigMediaController {
    /**
     * Get all media for a specific gig
     * GET /api/gigs/:gigId/media
     */
    static async getGigMedia(req, res) {
        try {
            const { gigId } = req.params;
            
            const media = await GigMediaService.getGigMedia(gigId);
            
            res.status(200).json({
                status: 'success',
                message: 'Gig media retrieved successfully',
                data: media,
                count: media.length
            });
        } catch (error) {
            console.error('Controller error - getting gig media:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to retrieve gig media',
                data: null
            });
        }
    }

    /**
     * Create a new media entry for a gig
     * POST /api/gigs/:gigId/media
     */
    static async createGigMedia(req, res) {
        try {
            const { gigId } = req.params;
            const mediaData = {
                gig_id: gigId,
                ...req.body
            };
            
            const newMedia = await GigMediaService.createGigMedia(mediaData);
            
            res.status(201).json({
                status: 'success',
                message: 'Gig media created successfully',
                data: newMedia
            });
        } catch (error) {
            console.error('Controller error - creating gig media:', error);
            res.status(400).json({
                status: 'error',
                message: error.message || 'Failed to create gig media',
                data: null
            });
        }
    }

    /**
     * Update a media entry
     * PUT /api/gigs/:gigId/media/:id
     */
    static async updateGigMedia(req, res) {
        try {
            const { gigId, id } = req.params;
            const updateData = req.body;
            
            const updatedMedia = await GigMediaService.updateGigMedia(parseInt(id), gigId, updateData);
            
            res.status(200).json({
                status: 'success',
                message: 'Gig media updated successfully',
                data: updatedMedia
            });
        } catch (error) {
            console.error('Controller error - updating gig media:', error);
            res.status(400).json({
                status: 'error',
                message: error.message || 'Failed to update gig media',
                data: null
            });
        }
    }

    /**
     * Delete a media entry
     * DELETE /api/gigs/:gigId/media/:id
     */
    static async deleteGigMedia(req, res) {
        try {
            const { gigId, id } = req.params;
            
            await GigMediaService.deleteGigMedia(parseInt(id), gigId);
            
            res.status(200).json({
                status: 'success',
                message: 'Gig media deleted successfully',
                data: null
            });
        } catch (error) {
            console.error('Controller error - deleting gig media:', error);
            res.status(400).json({
                status: 'error',
                message: error.message || 'Failed to delete gig media',
                data: null
            });
        }
    }

    /**
     * Delete all media for a specific gig
     * DELETE /api/gigs/:gigId/media
     */
    static async deleteAllGigMedia(req, res) {
        try {
            const { gigId } = req.params;
            
            await GigMediaService.deleteAllGigMedia(gigId);
            
            res.status(200).json({
                status: 'success',
                message: 'All gig media deleted successfully',
                data: null
            });
        } catch (error) {
            console.error('Controller error - deleting all gig media:', error);
            res.status(400).json({
                status: 'error',
                message: error.message || 'Failed to delete all gig media',
                data: null
            });
        }
    }
}

module.exports = GigMediaController;
