/**
 * File Validation Middleware
 * 
 * @file fileValidation.middleware.js
 * @description Middleware for validating uploaded files
 * Validates file types, sizes, and other constraints before processing
 */

/**
 * Validate file extensions against allowed types
 * @param {Object} file - Multer file object
 * @param {Array} allowedExtensions - Array of allowed file extensions
 * @returns {boolean} True if file extension is allowed
 */
const validateFileExtension = (file, allowedExtensions = []) => {
  if (!file || !file.originalname) return false;
  
  const fileExtension = file.originalname.toLowerCase().split('.').pop();
  return allowedExtensions.length === 0 || allowedExtensions.includes(fileExtension);
};

/**
 * Validate file MIME type against allowed types
 * @param {Object} file - Multer file object
 * @param {Array} allowedMimeTypes - Array of allowed MIME types
 * @returns {boolean} True if MIME type is allowed
 */
const validateFileMimeType = (file, allowedMimeTypes = []) => {
  if (!file || !file.mimetype) return false;
  
  return allowedMimeTypes.length === 0 || allowedMimeTypes.includes(file.mimetype);
};

/**
 * Comprehensive file validation with dual approach for problematic file types
 * @param {Object} file - Multer file object
 * @param {Object} options - Validation options
 * @returns {Object} Validation result with success status and errors
 */
const validateSingleFile = (file, options = {}) => {
  const {
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'zip', 'rar'],
    allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip', 'application/x-rar-compressed', 'application/x-zip-compressed'
    ]
  } = options;

  const errors = [];

  // Check file size
  if (file.size > maxFileSize) {
    errors.push(`File "${file.originalname}" exceeds maximum size of ${maxFileSize / (1024 * 1024)}MB`);
  }

  // Dual validation approach: Pass if EITHER MIME type OR extension is valid
  // This handles cases where .png files might have incorrect MIME type detection
  const mimeTypeValid = validateFileMimeType(file, allowedMimeTypes);
  const extensionValid = validateFileExtension(file, allowedExtensions);

  if (!mimeTypeValid && !extensionValid) {
    errors.push(`File "${file.originalname}" has invalid type. Allowed types: ${allowedExtensions.join(', ')}`);
  }

  // Log validation details for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`📁 File validation for "${file.originalname}":`, {
      mimetype: file.mimetype,
      extension: file.originalname.split('.').pop(),
      mimeTypeValid,
      extensionValid,
      passed: mimeTypeValid || extensionValid
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Middleware to validate uploaded files
 * @param {Object} options - Validation options
 * @returns {Function} Express middleware function
 */
const validateFiles = (options = {}) => {
  return (req, res, next) => {
    try {
      const {
        maxFiles = 10,
        maxTotalSize = 50 * 1024 * 1024, // 50MB default
        required = true
      } = options;

      const files = req.files;

      // Check if files are required
      if (required && (!files || files.length === 0)) {
        return res.status(400).json({
          status: 'error',
          message: 'No files provided'
        });
      }

      // If no files and not required, continue
      if (!files || files.length === 0) {
        return next();
      }

      // Check maximum number of files
      if (files.length > maxFiles) {
        return res.status(400).json({
          status: 'error',
          message: `Maximum ${maxFiles} files allowed`
        });
      }

      // Check total size
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > maxTotalSize) {
        return res.status(400).json({
          status: 'error',
          message: `Total file size exceeds maximum of ${maxTotalSize / (1024 * 1024)}MB`
        });
      }

      // Validate each file
      const allErrors = [];
      for (const file of files) {
        const validation = validateSingleFile(file, options);
        if (!validation.valid) {
          allErrors.push(...validation.errors);
        }
      }

      if (allErrors.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'File validation failed',
          errors: allErrors
        });
      }

      // All validations passed
      console.log(`✅ File validation passed for ${files.length} files`);
      next();

    } catch (error) {
      console.error('❌ File validation middleware error:', error);
      res.status(500).json({
        status: 'error',
        message: 'File validation error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

/**
 * Preset configurations for common file validation scenarios
 */
const presets = {
  // For delivery files (documents, images, archives)
  delivery: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxTotalSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 10,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'zip', 'rar', 'txt'],
    allowedMimeTypes: [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip', 'application/x-rar-compressed', 'application/x-zip-compressed',
      'text/plain'
    ]
  },

  // For profile images
  profileImage: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxTotalSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
    allowedExtensions: ['jpg', 'jpeg', 'png'],
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png']
  },

  // For gig media
  gigMedia: {
    maxFileSize: 20 * 1024 * 1024, // 20MB
    maxTotalSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 5,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov'],
    allowedMimeTypes: [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'video/mp4', 'video/quicktime'
    ]
  }
};

/**
 * Helper function to create middleware with preset configurations
 * @param {string} presetName - Name of the preset configuration
 * @param {Object} overrides - Options to override preset values
 * @returns {Function} Express middleware function
 */
const createPresetMiddleware = (presetName, overrides = {}) => {
  const preset = presets[presetName];
  if (!preset) {
    throw new Error(`Unknown preset: ${presetName}`);
  }

  const options = { ...preset, ...overrides };
  return validateFiles(options);
};

module.exports = {
  validateFiles,
  validateSingleFile,
  validateFileExtension,
  validateFileMimeType,
  presets,
  createPresetMiddleware
};
