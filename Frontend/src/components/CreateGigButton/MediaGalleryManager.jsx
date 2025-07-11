// src/components/CreateGigButton/MediaGalleryManager.jsx
import React, { useState } from 'react';
import MediaUpload from '../MediaUpload/MediaUpload';
import MultipleMediaUpload from '../MediaUpload/MultipleMediaUpload';
import { XMarkIcon, PhotoIcon, VideoCameraIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const MediaGalleryManager = ({ gigData, onInputChange, errors }) => {
  const [uploadError, setUploadError] = useState(null);
  const [galleryMode, setGalleryMode] = useState('single'); // 'single' or 'multiple'
  const [additionalMedia, setAdditionalMedia] = useState([]);

  // Handle cover image upload success
  const handleCoverUploadSuccess = (uploadResult) => {
    console.log('Cover image upload success:', uploadResult);
    onInputChange('cover_image', uploadResult.url);
    setUploadError(null);
  };

  // Handle cover image upload error
  const handleCoverUploadError = (errorMsg) => {
    console.log('Cover upload error:', errorMsg);
    setUploadError(errorMsg);
    onInputChange('cover_image', '');
  };

  // Handle multiple files upload success
  const handleMultipleUploadSuccess = (uploadResults) => {
    console.log('Multiple files upload success:', uploadResults);
    setAdditionalMedia(prev => [...prev, ...uploadResults]);
    setUploadError(null);
    
    // Store both URLs and metadata in gigData for later use
    const newMedia = uploadResults.map(result => ({
      url: result.url,
      fileName: result.fileName,
      fileSize: result.fileSize,
      fileType: result.fileType
    }));
    
    const allMedia = [...(gigData.additional_media_metadata || []), ...newMedia];
    const allMediaUrls = allMedia.map(item => item.url);
    
    onInputChange('additional_media', allMediaUrls);
    onInputChange('additional_media_metadata', allMedia);
  };

  // Handle multiple files upload error
  const handleMultipleUploadError = (errorMsg) => {
    console.log('Multiple upload error:', errorMsg);
    setUploadError(errorMsg);
  };

  // Remove additional media item
  const removeAdditionalMedia = (index) => {
    const newMedia = additionalMedia.filter((_, i) => i !== index);
    setAdditionalMedia(newMedia);
    
    const newUrls = newMedia.map(item => item.url);
    onInputChange('additional_media', newUrls);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get media type icon
  const getMediaTypeIcon = (fileType) => {
    if (fileType && fileType.startsWith('image/')) {
      return <PhotoIcon className="h-5 w-5 text-blue-500" />;
    } else if (fileType && fileType.startsWith('video/')) {
      return <VideoCameraIcon className="h-5 w-5 text-purple-500" />;
    }
    return <PhotoIcon className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Cover Image Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          Gig Cover Image <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-slate-600">Upload an eye-catching cover image for your gig. This will be the first thing buyers see.</p>
        
        {gigData.cover_image ? (
          <div className="space-y-4">
            <div className="relative inline-block group">
              <img 
                src={gigData.cover_image} 
                alt="Gig cover preview" 
                className="max-w-full h-48 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  console.error('Cover image failed to load:', gigData.cover_image);
                  setUploadError('Failed to load uploaded image. Please try uploading again.');
                  onInputChange('cover_image', '');
                }}
              />
              <button
                type="button"
                onClick={() => {
                  onInputChange('cover_image', '');
                  setUploadError(null);
                }}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove cover image"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckCircleIcon className="h-5 w-5" />
              <span>Cover image uploaded successfully</span>
            </div>
          </div>
        ) : (
          <MediaUpload 
            onFileUpload={handleCoverUploadSuccess}
            onUploadError={handleCoverUploadError}
            acceptedTypes="image/*"
          />
        )}
        
        {/* Display errors */}
        {uploadError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
            {uploadError}
          </p>
        )}
        {errors.cover_image && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
            {errors.cover_image}
          </p>
        )}
      </div>

      {/* Additional Media Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              Additional Media <span className="text-gray-500">(Optional)</span>
            </label>
            <p className="text-sm text-slate-600">Add more images or videos to showcase your service in detail.</p>
          </div>
          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setGalleryMode('single')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                galleryMode === 'single'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              Single Upload
            </button>
            <button
              type="button"
              onClick={() => setGalleryMode('multiple')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                galleryMode === 'multiple'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              Batch Upload
            </button>
          </div>
        </div>

        {/* Upload Interface */}
        {galleryMode === 'single' ? (
          <MediaUpload 
            onFileUpload={(result) => handleMultipleUploadSuccess([result])}
            onUploadError={handleMultipleUploadError}
            acceptedTypes="image/*,video/*"
          />
        ) : (
          <MultipleMediaUpload
            onFilesUpload={handleMultipleUploadSuccess}
            onUploadError={handleMultipleUploadError}
            maxFiles={8}
            allowImages={true}
            allowVideos={true}
            existingFiles={additionalMedia}
          />
        )}

        {/* Additional Media Gallery */}
        {additionalMedia.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Gallery ({additionalMedia.length}/8)
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {additionalMedia.map((media, index) => (
                <div key={index} className="relative group border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 shadow-sm">
                  <div className="aspect-square flex items-center justify-center p-2">
                    {media.fileType && media.fileType.startsWith('image/') ? (
                      <img 
                        src={media.url} 
                        alt={media.fileName || `Media ${index + 1}`}
                        className="max-w-full max-h-full object-cover rounded"
                        onError={() => {
                          console.error('Additional media failed to load:', media.url);
                        }}
                      />
                    ) : media.fileType && media.fileType.startsWith('video/') ? (
                      <video 
                        src={media.url}
                        className="max-w-full max-h-full object-cover rounded"
                        controls={false}
                        muted
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        {getMediaTypeIcon(media.fileType)}
                        <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center truncate max-w-full">
                          {media.fileName || 'Media'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity">
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => window.open(media.url, '_blank')}
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1"
                        title="View full size"
                      >
                        <EyeIcon className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeAdditionalMedia(index)}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                        title="Remove media"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Media info */}
                  <div className="p-2 bg-white dark:bg-gray-900 border-t">
                    <div className="flex items-center space-x-1">
                      {getMediaTypeIcon(media.fileType)}
                      <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1" title={media.fileName}>
                        {media.fileName || 'Media'}
                      </span>
                    </div>
                    {media.fileSize && (
                      <p className="text-xs text-gray-400 mt-1">
                        {formatFileSize(media.fileSize)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Add more button */}
              {additionalMedia.length < 8 && (
                <button
                  type="button"
                  onClick={() => setGalleryMode('single')}
                  className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <PlusIcon className="h-8 w-8 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Add more</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaGalleryManager;
