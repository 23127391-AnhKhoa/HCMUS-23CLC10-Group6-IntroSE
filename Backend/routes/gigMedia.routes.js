// backend/routes/gigMedia.routes.js
const express = require('express');
const router = express.Router();
const GigMediaController = require('../controllers/gigMedia.controller');

// Get all media for a specific gig
// GET /api/gigs/:gigId/media
router.get('/:gigId/media', GigMediaController.getGigMedia);

// Create a new media entry for a gig
// POST /api/gigs/:gigId/media
router.post('/:gigId/media', GigMediaController.createGigMedia);

// Update a media entry
// PUT /api/gigs/:gigId/media/:id
router.put('/:gigId/media/:id', GigMediaController.updateGigMedia);

// Delete a specific media entry
// DELETE /api/gigs/:gigId/media/:id
router.delete('/:gigId/media/:id', GigMediaController.deleteGigMedia);

// Delete all media for a specific gig
// DELETE /api/gigs/:gigId/media
router.delete('/:gigId/media', GigMediaController.deleteAllGigMedia);

module.exports = router;
