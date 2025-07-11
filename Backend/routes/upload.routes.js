// backend/routes/upload.routes.js
const express = require('express');
const router = express.Router();
const { singleUpload, multipleUpload, fieldsUpload } = require('../middleware/multer.middleware');
const uploadController = require('../controllers/upload.controller');

// POST /api/upload - Upload một file
router.post('/', singleUpload, uploadController.uploadFile);

// POST /api/upload/multiple - Upload nhiều files cùng lúc
router.post('/multiple', multipleUpload, uploadController.uploadMultipleFiles);

// POST /api/upload/fields - Upload files theo fields (cover, gallery, videos)
router.post('/fields', fieldsUpload, uploadController.uploadFilesWithFields);
module.exports = router;