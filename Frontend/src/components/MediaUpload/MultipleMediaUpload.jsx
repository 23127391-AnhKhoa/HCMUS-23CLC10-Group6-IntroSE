// src/components/MediaUpload/MultipleMediaUpload.jsx
import React, { useState, useRef } from 'react';
import ApiService from '../../services/CreateGigs.service';
import { XMarkIcon, PhotoIcon, VideoCameraIcon, EyeIcon } from '@heroicons/react/24/outline';

const MultipleMediaUpload = ({ 
  onFilesUpload, 
  onUploadError, 
  maxFiles = 10,
  allowImages = true,
  allowVideos = true,
  existingFiles = []
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const validateFiles = (files) => {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime'];
    const allowedTypes = [
      ...(allowImages ? allowedImageTypes : []),
      ...(allowVideos ? allowedVideoTypes : [])
    ];
    
    const maxSize = 50 * 1024 * 1024; // 50MB
    const totalFiles = selectedFiles.length + existingFiles.length + files.length;

    if (totalFiles > maxFiles) {
      return `Too many files. Maximum ${maxFiles} files allowed. You currently have ${selectedFiles.length + existingFiles.length} files.`;
    }

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return `File "${file.name}" has unsupported type. Only ${allowImages ? 'images' : ''}${allowImages && allowVideos ? ' and ' : ''}${allowVideos ? 'videos' : ''} are allowed.`;
      }

      if (file.size > maxSize) {
        return `File "${file.name}" is too large. Maximum size is 50MB.`;
      }
    }

    return null;
  };

  const createPreviewUrls = (files) => {
    const urls = files.map(file => {
      if (file.type.startsWith('image/')) {
        return {
          type: 'image',
          url: URL.createObjectURL(file),
          file: file
        };
      } else if (file.type.startsWith('video/')) {
        return {
          type: 'video',
          url: URL.createObjectURL(file),
          file: file
        };
      }
      return null;
    }).filter(Boolean);

    return urls;
  };

  const handleFiles = (files) => {
    const validationError = validateFiles(files);
    if (validationError) {
      onUploadError?.(validationError);
      return;
    }

    const newPreviews = createPreviewUrls(files);
    setSelectedFiles(prev => [...prev, ...files]);
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    
    // Revoke URL to prevent memory leaks
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index].url);
    }
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      onUploadError?.('Please select files to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      console.log('📤 Uploading multiple files:', selectedFiles.length);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const response = await ApiService.uploadMultipleFiles(selectedFiles);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      console.log('✅ Multiple upload response:', response);
      
      if (response.status === 'success' && response.data) {
        setTimeout(() => {
          onFilesUpload?.(response.data);
          // Clear selected files after successful upload
          setSelectedFiles([]);
          setPreviewUrls([]);
          // Revoke all URLs
          previewUrls.forEach(preview => {
            URL.revokeObjectURL(preview.url);
          });
        }, 500);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('❌ Multiple upload error:', error);
      
      let errorMessage = 'Upload failed';
      
      if (error.message.includes('Too many files')) {
        errorMessage = `Too many files. Maximum ${maxFiles} files allowed.`;
      } else if (error.message.includes('File too large')) {
        errorMessage = 'One or more files are too large. Maximum size is 50MB.';
      } else if (error.message.includes('File type not allowed')) {
        errorMessage = 'One or more files have unsupported types.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getFileTypeIcon = (type) => {
    if (type === 'image') {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />;
    } else if (type === 'video') {
      return <VideoCameraIcon className="h-8 w-8 text-purple-500" />;
    }
    return null;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-105'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={`${allowImages ? 'image/*' : ''}${allowImages && allowVideos ? ',' : ''}${allowVideos ? 'video/*' : ''}`}
          onChange={handleChange}
          disabled={isUploading}
          multiple
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-indigo-600">{uploadProgress}%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Uploading {selectedFiles.length} files...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex space-x-2 mb-4">
              {allowImages && <PhotoIcon className="h-12 w-12 text-gray-400" />}
              {allowVideos && <VideoCameraIcon className="h-12 w-12 text-gray-400" />}
            </div>
            <div className="mb-4">
              <button
                type="button"
                onClick={onButtonClick}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:text-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 transition-colors"
              >
                Choose files
              </button>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                or drag and drop
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {allowImages && allowVideos ? 'Images and Videos' : allowImages ? 'Images' : 'Videos'} up to 50MB each
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Maximum {maxFiles} files total ({selectedFiles.length + existingFiles.length}/{maxFiles} selected)
            </p>
          </div>
        )}
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Selected Files ({selectedFiles.length})
            </h4>
            <button
              onClick={uploadFiles}
              disabled={isUploading || selectedFiles.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`}
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {previewUrls.map((preview, index) => (
              <div key={index} className="relative group border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                <div className="aspect-square flex items-center justify-center p-2">
                  {preview.type === 'image' ? (
                    <img 
                      src={preview.url} 
                      alt={preview.file.name}
                      className="max-w-full max-h-full object-cover rounded"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      {getFileTypeIcon(preview.type)}
                      <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center truncate max-w-full">
                        {preview.file.name}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity">
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove file"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </div>
                
                <div className="p-2 bg-white dark:bg-gray-900 border-t">
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={preview.file.name}>
                    {preview.file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatFileSize(preview.file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleMediaUpload;
