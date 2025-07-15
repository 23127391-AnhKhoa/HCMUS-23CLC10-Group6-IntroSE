/**
 * File Validation Utilities
 * 
 * @file fileValidation.js
 * @description Utilities for validating uploaded files
 */

const FileValidation = {
  /**
   * Validate file size
   * 
   * @param {Object} file - File object
   * @param {number} maxSize - Maximum file size in bytes
   * @returns {boolean} - Is file size valid
   */
  validateFileSize: (file, maxSize = 10 * 1024 * 1024) => { // 10MB default
    return file.size <= maxSize;
  },

  /**
   * Validate file type
   * 
   * @param {Object} file - File object
   * @param {Array} allowedTypes - Array of allowed MIME types
   * @returns {boolean} - Is file type valid
   */
  validateFileType: (file, allowedTypes = []) => {
    const defaultAllowedTypes = [
      // Images
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/tiff',
      'image/svg+xml',
      'image/vnd.adobe.photoshop', // .psd
      
      // Videos
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm',
      
      // Audio
      'audio/mpeg', // .mp3
      'audio/wav',
      'audio/ogg',
      'audio/aac',
      'audio/flac',
      'audio/x-ms-wma',
      
      // Documents
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'text/plain', // .txt
      'text/csv', // .csv
      'application/rtf', // .rtf
      'application/vnd.oasis.opendocument.text', // .odt
      'application/vnd.oasis.opendocument.spreadsheet', // .ods
      'application/vnd.oasis.opendocument.presentation', // .odp
      
      // Archives
      'application/zip',
      'application/x-zip-compressed',
      'application/zip-compressed',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
      'application/x-bzip2',
      
      // Design & Development
      'application/postscript', // .ai, .eps
      'application/json',
      'application/xml',
      'text/xml',
      'text/html',
      'text/css',
      'application/javascript',
      'text/markdown',
      
      // Other common types
      'application/octet-stream', // Generic binary
      'text/x-python',
      'application/x-python-code',
      'text/x-java-source',
      'text/x-c',
      'text/x-c++',
      'text/x-php'
    ];

    const typesToCheck = allowedTypes.length > 0 ? allowedTypes : defaultAllowedTypes;
    return typesToCheck.includes(file.mimetype);
  },

  /**
   * Validate file name
   * 
   * @param {string} filename - File name
   * @returns {boolean} - Is file name valid
   */
  validateFileName: (filename) => {
    // Check for dangerous characters
    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (dangerousChars.test(filename)) {
      return false;
    }

    // Check for reserved names (Windows)
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
    if (reservedNames.test(filename)) {
      return false;
    }

    // Check length
    if (filename.length > 255) {
      return false;
    }

    return true;
  },

  /**
   * Check if file is executable
   * 
   * @param {Object} file - File object
   * @returns {boolean} - Is file executable
   */
  isExecutableFile: (file) => {
    const executableTypes = [
      'application/x-executable',
      'application/x-msdos-program',
      'application/x-msdownload',
      'application/x-winexe',
      'application/octet-stream'
    ];

    const executableExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.scr', '.vbs', '.vbe', '.js', '.jse',
      '.wsf', '.wsh', '.msi', '.msp', '.hta', '.cpl', '.msc', '.jar'
    ];

    // Check MIME type
    if (executableTypes.includes(file.mimetype)) {
      return true;
    }

    // Check extension
    const filename = file.originalname || file.name || '';
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    
    return executableExtensions.includes(extension);
  },

  /**
   * Validate multiple files
   * 
   * @param {Array} files - Array of files
   * @param {Object} options - Validation options
   * @returns {Object} - Validation result
   */
  validateFiles: (files, options = {}) => {
    const {
      maxFileSize = 10 * 1024 * 1024, // 10MB
      maxTotalSize = 50 * 1024 * 1024, // 50MB
      allowedTypes = [],
      maxFiles = 10
    } = options;

    const errors = [];
    const validFiles = [];

    // Check file count
    if (files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
      return { valid: false, errors, validFiles };
    }

    let totalSize = 0;

    files.forEach((file, index) => {
      const fileErrors = [];

      // Check file size
      if (!FileValidation.validateFileSize(file, maxFileSize)) {
        fileErrors.push(`File ${index + 1} exceeds maximum size of ${maxFileSize / (1024 * 1024)}MB`);
      }

      // Check file type
      if (!FileValidation.validateFileType(file, allowedTypes)) {
        fileErrors.push(`File ${index + 1} has invalid type: ${file.mimetype}`);
      }

      // Check file name
      if (!FileValidation.validateFileName(file.originalname || file.name)) {
        fileErrors.push(`File ${index + 1} has invalid name`);
      }

      // Check if executable
      if (FileValidation.isExecutableFile(file)) {
        fileErrors.push(`File ${index + 1} is executable and not allowed`);
      }

      totalSize += file.size;

      if (fileErrors.length === 0) {
        validFiles.push(file);
      } else {
        errors.push(...fileErrors);
      }
    });

    // Check total size
    if (totalSize > maxTotalSize) {
      errors.push(`Total file size exceeds maximum of ${maxTotalSize / (1024 * 1024)}MB`);
    }

    return {
      valid: errors.length === 0,
      errors,
      validFiles,
      totalSize
    };
  },

  /**
   * Sanitize file name
   * 
   * @param {string} filename - Original file name
   * @returns {string} - Sanitized file name
   */
  sanitizeFileName: (filename) => {
    // Remove dangerous characters
    let sanitized = filename.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
    
    // Limit length
    if (sanitized.length > 255) {
      const extension = sanitized.substring(sanitized.lastIndexOf('.'));
      const name = sanitized.substring(0, 255 - extension.length);
      sanitized = name + extension;
    }

    return sanitized;
  }
};

module.exports = FileValidation;
