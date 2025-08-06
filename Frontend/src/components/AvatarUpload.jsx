import React, { useState, useEffect } from 'react';
import ApiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

const AvatarUpload = ({ currentAvatar, onAvatarChange, size = 'large', saveImmediately = true }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentAvatar);
  const { updateUser, authUser, token } = useAuth(); // Lấy token từ AuthContext

  // Update preview when currentAvatar changes
  useEffect(() => {
    setPreviewUrl(currentAvatar);
  }, [currentAvatar]);

  // Update avatar in database
  const updateAvatarInDB = async (avatarUrl) => {
    try {
      // Sử dụng token từ AuthContext thay vì localStorage
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:8000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          avt_url: avatarUrl,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update avatar in database');
      }

      const data = await response.json();
      console.log('Avatar updated in database:', data);
      return data;
    } catch (error) {
      console.error('Database update error:', error);
      throw error;
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    // Reset file input để có thể chọn lại cùng file
    event.target.value = '';

    try {
      setUploading(true);
      
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload file using ApiService
      const uploadResult = await ApiService.uploadFile(file, 'avatar');
      
      if (uploadResult.status === 'success' && uploadResult.data) {
        const avatarUrl = uploadResult.data.url;
        
        // Only save to database if saveImmediately is true
        if (saveImmediately) {
          // Update avatar in database
          await updateAvatarInDB(avatarUrl);
          
          // Update AuthContext with new avatar
          if (authUser && updateUser) {
            updateUser({
              ...authUser,
              avatar_url: avatarUrl,
              avt_url: avatarUrl
            });
          }
          
          alert('Avatar updated successfully!');
        }
        
        // Clean up object URL
        URL.revokeObjectURL(objectUrl);
        setPreviewUrl(avatarUrl);
        
        // Always call callback để parent component biết avatar đã thay đổi
        if (onAvatarChange) {
          onAvatarChange(avatarUrl);
        }
        
      } else {
        throw new Error('Upload failed: ' + (uploadResult.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      alert('Failed to upload avatar: ' + error.message);
      
      // Cleanup object URL and reset to original
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(currentAvatar);
    } finally {
      setUploading(false);
    }
  };

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20',
    xlarge: 'w-24 h-24'
  };

  const iconSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xlarge: 'text-lg'
  };

  return (
    <div className="relative inline-block">
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center relative`}>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Image load error:', e);
              setPreviewUrl(null);
            }}
          />
        ) : (
          <span className={`${iconSizes[size]} text-gray-400 font-semibold`}>
            👤
          </span>
        )}
        
        {/* Upload overlay */}
        {!uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
            <span className="text-white text-xs font-medium">
              Change
            </span>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={uploading}
      />
      
      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-full">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;  