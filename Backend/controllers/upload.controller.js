// backend/controllers/upload.controller.js
const uploadService = require('../services/upload.service');
const supabase = require('../config/supabaseClient');

// Centralized allowed file types
const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'image/bmp', 'image/tiff', 'image/ico',
  
  // Videos
  'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm',
  'video/mkv', 'video/3gp', 'video/quicktime',
  
  // Documents
  'application/pdf', 'text/plain', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/csv', 'application/rtf',
  
  // Audio
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/flac',
  'audio/aac', 'audio/wma', 'audio/m4a',
  
  // Archives
  'application/zip', 'application/x-zip-compressed', 'application/zip-compressed',
  'application/x-rar-compressed', 'application/vnd.rar',
  'application/x-7z-compressed', 'application/x-tar', 'application/gzip',
  
  // Design files
  'application/vnd.adobe.photoshop', 'application/postscript',
  'application/vnd.adobe.illustrator', 'image/vnd.adobe.photoshop',
  
  // Development files
  'application/json', 'application/xml', 'text/xml', 'text/html',
  'text/css', 'text/javascript', 'application/javascript'
];

const uploadFile = async (req, res) => {
  try {
    console.log('📤 Upload request received');
    
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded. Please select a file to upload.',
      });
    }

    console.log('📁 File info:', {
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype
    });

    // Validate file type (multer middleware đã kiểm tra, nhưng double check)
    if (!ALLOWED_FILE_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({
        status: 'error',
        message: 'File type not allowed. Contact support if you need to upload a different file type.',
      });
    }

    // Validate file size (multer middleware đã kiểm tra, nhưng double check)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (req.file.size > maxSize) {
      return res.status(400).json({
        status: 'error',
        message: 'File too large. Maximum size is 50MB.',
      });
    }

    console.log('✅ File validation passed, uploading to Supabase...');
    const uploadResult = await uploadService.uploadFile(req.file);
    console.log('✅ Upload successful:', uploadResult);

    res.status(200).json({
      status: 'success',
      message: 'File uploaded successfully.',
      data: uploadResult,
    });
  } catch (error) {
    console.error('❌ Upload controller error:', error);
    
    // Handle specific errors
    let errorMessage = 'Failed to upload file';
    let statusCode = 500;

    if (error.message.includes('File too large')) {
      errorMessage = 'File too large. Maximum size is 50MB.';
      statusCode = 400;
    } else if (error.message.includes('File type not allowed')) {
      errorMessage = 'File type not allowed. Only images and videos are accepted.';
      statusCode = 400;
    } else if (error.message.includes('signature')) {
      errorMessage = 'Storage authentication failed. Please try again.';
      statusCode = 503;
    } else if (error.message.includes('bucket')) {
      errorMessage = 'Storage bucket configuration error. Please contact support.';
      statusCode = 503;
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(statusCode).json({
      status: 'error',
      message: errorMessage,
    });
  }
};

// Upload multiple files
const uploadMultipleFiles = async (req, res) => {
  try {
    console.log('📤 Multiple upload request received');
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No files uploaded. Please select files to upload.',
      });
    }

    console.log(`📁 Files info: ${req.files.length} files`);
    req.files.forEach((file, index) => {
      console.log(`File ${index + 1}:`, {
        name: file.originalname,
        size: file.size,
        type: file.mimetype
      });
    });

    // Validate all files
    const maxSize = 50 * 1024 * 1024; // 50MB
    const maxFiles = 10;

    if (req.files.length > maxFiles) {
      return res.status(400).json({
        status: 'error',
        message: `Too many files. Maximum ${maxFiles} files allowed per upload.`,
      });
    }

    // Validate file type for multiple files
    for (const file of req.files) {
      if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        return res.status(400).json({
          status: 'error',
          message: `File "${file.originalname}" has unsupported type. Contact support if you need to upload a different file type.`,
        });
      }

      if (file.size > maxSize) {
        return res.status(400).json({
          status: 'error',
          message: `File "${file.originalname}" is too large. Maximum size is 50MB.`,
        });
      }
    }

    console.log('✅ All files validation passed, uploading to Supabase...');
    const uploadResults = await uploadService.uploadMultipleFiles(req.files);
    console.log('✅ All uploads successful:', uploadResults.length);

    res.status(200).json({
      status: 'success',
      message: `${uploadResults.length} files uploaded successfully.`,
      data: uploadResults,
    });
  } catch (error) {
    console.error('❌ Multiple upload controller error:', error);
    
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to upload files',
    });
  }
};

// Upload files with fields (cover + gallery + videos)
const uploadFilesWithFields = async (req, res) => {
  try {
    console.log('📤 Fields upload request received');
    console.log('Files received:', {
      cover_image: req.files?.cover_image?.length || 0,
      gallery_images: req.files?.gallery_images?.length || 0,
      videos: req.files?.videos?.length || 0
    });

    const results = {
      cover_image: null,
      gallery_images: [],
      videos: []
    };

    // Upload cover image
    if (req.files?.cover_image && req.files.cover_image.length > 0) {
      console.log('📸 Uploading cover image...');
      results.cover_image = await uploadService.uploadFile(req.files.cover_image[0]);
    }

    // Upload gallery images
    if (req.files?.gallery_images && req.files.gallery_images.length > 0) {
      console.log(`🖼️ Uploading ${req.files.gallery_images.length} gallery images...`);
      results.gallery_images = await uploadService.uploadMultipleFiles(req.files.gallery_images);
    }

    // Upload videos
    if (req.files?.videos && req.files.videos.length > 0) {
      console.log(`🎬 Uploading ${req.files.videos.length} videos...`);
      results.videos = await uploadService.uploadMultipleFiles(req.files.videos);
    }

    const totalFiles = [results.cover_image].filter(Boolean).length + 
                      results.gallery_images.length + 
                      results.videos.length;

    res.status(200).json({
      status: 'success',
      message: `${totalFiles} files uploaded successfully.`,
      data: results,
    });
  } catch (error) {
    console.error('❌ Fields upload controller error:', error);
    
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to upload files',
    });
  }
};

// Test endpoint to check Supabase storage
const testStorage = async (req, res) => {
  try {
    // Test storage connection
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to connect to Supabase storage',
        error: error.message
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Storage connection successful',
      buckets: buckets.map(bucket => bucket.name)
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Test bucket creation
const testBucketCreation = async (req, res) => {
  try {
    const bucketName = 'gig-media';
    
    // Kiểm tra bucket hiện có
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to list buckets',
        error: listError.message
      });
    }

    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      // Tạo bucket mới
      const { data: createData, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/*', 'video/*'],
        fileSizeLimit: 52428800, // 50MB
      });
      
      if (createError) {
        return res.status(500).json({
          status: 'error',
          message: 'Failed to create bucket',
          error: createError.message,
          details: createError
        });
      }
      
      return res.status(200).json({
        status: 'success',
        message: 'Bucket created successfully',
        bucket: createData,
        allBuckets: buckets.map(b => b.name)
      });
    } else {
      return res.status(200).json({
        status: 'success',
        message: 'Bucket already exists',
        allBuckets: buckets.map(b => b.name)
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  uploadFile,
  uploadMultipleFiles,
  uploadFilesWithFields,
  testStorage,
  testBucketCreation,
  ALLOWED_FILE_TYPES
};