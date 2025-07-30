// backend/middleware/multer.middleware.js
const multer = require('multer');

// Cấu hình multer để sử dụng memory storage (lưu file trong RAM)
const storage = multer.memoryStorage();

// Cấu hình multer với giới hạn file
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit per file
    files: 10, // Maximum 10 files per upload
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for flexibility
    const allowedMimeTypes = [
      // Images
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/tiff',
      'image/svg+xml',
      // Videos
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/quicktime',
      'video/webm',
      'video/mkv',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // Text files
      'text/plain',
      'text/csv',
      'text/html',
      'text/css',
      'text/javascript',
      'application/json',
      'application/xml',
      // Archives
      'application/zip',
      'application/x-zip-compressed',
      'application/zip-compressed',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
      // Audio
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/mp3',
      // Other common formats
      'application/octet-stream'
    ];
    
    // For delivery uploads, allow all file types
    if (req.route && req.route.path.includes('upload-delivery')) {
      cb(null, true);
    } else if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Please contact support if you need to upload this file type.'), false);
    }
  },
});

// Single file upload
const singleUpload = upload.single('file');

// Multiple files upload (max 10 files)
const multipleUpload = upload.array('files', 10);

// Delivery files upload (for order deliveries) - Allow all file types
const deliveryUpload = upload.array('deliveryFiles', 10);

// Fields-based upload for mixed uploads
const fieldsUpload = upload.fields([
  { name: 'cover_image', maxCount: 1 },
  { name: 'gallery_images', maxCount: 8 },
  { name: 'videos', maxCount: 2 }
]);

module.exports = {
  upload,
  singleUpload,
  multipleUpload,
  deliveryUpload,
  fieldsUpload
};
