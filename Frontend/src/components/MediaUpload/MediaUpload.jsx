// src/components/MediaUpload/MediaUpload.jsx
import React, { useState, useRef } from 'react';
import ApiService from '../../services/CreateGigs.service';

const MediaUpload = ({ onFileUpload, onUploadError, acceptedTypes = "image/*,video/*" }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const validateFile = (file) => {
    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/quicktime'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return 'File type not allowed. Only images (JPEG, JPG, PNG, GIF, WebP) and videos (MP4, AVI, MOV) are allowed.';
    }

    // Validate file size (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File too large. Maximum size is 50MB.';
    }

    return null;
  };

  const handleFile = async (file) => {
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      onUploadError?.(validationError);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      console.log('📤 Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await ApiService.uploadFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      console.log('✅ Upload response:', response);
      
      // Response structure: { status: 'success', data: { url: '...', fileName: '...', fileSize: ... } }
      if (response.status === 'success' && response.data && response.data.url) {
        setTimeout(() => {
          onFileUpload?.(response.data);
        }, 500);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      
      // Handle specific errors
      let errorMessage = 'Upload failed';
      
      if (error.message.includes('File too large')) {
        errorMessage = 'File too large. Maximum size is 50MB.';
      } else if (error.message.includes('File type not allowed')) {
        errorMessage = 'File type not allowed. Only images and videos are accepted.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('storage')) {
        errorMessage = 'Storage service unavailable. Please try again later.';
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

  return (
    <div className="w-full">
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
          accept={acceptedTypes}
          onChange={handleChange}
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-indigo-600">{uploadProgress}%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Uploading...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-4">
              <button
                type="button"
                onClick={onButtonClick}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:text-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 transition-colors"
              >
                Choose file
              </button>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                or drag and drop
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Images (PNG, JPG, GIF, WebP) or Videos (MP4, AVI, MOV) up to 50MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaUpload;
