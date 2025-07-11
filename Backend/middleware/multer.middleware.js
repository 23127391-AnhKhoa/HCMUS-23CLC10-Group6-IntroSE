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
    // Kiểm tra loại file
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/quicktime'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Only images (JPEG, JPG, PNG, GIF, WebP) and videos (MP4, AVI, MOV) are allowed.'), false);
    }
  },
});

// Single file upload
const singleUpload = upload.single('file');

// Multiple files upload (max 10 files)
const multipleUpload = upload.array('files', 10);

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
  fieldsUpload
};
