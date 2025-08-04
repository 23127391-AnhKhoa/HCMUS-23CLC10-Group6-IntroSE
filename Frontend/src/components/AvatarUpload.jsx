import React, { useState, useEffect } from 'react';
import ApiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

const AvatarUpload = ({ currentAvatar, onAvatarChange, size = 'large' }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentAvatar);
  const { updateUser, authUser } = useAuth();

  // Update preview when currentAvatar changes
  useEffect(() => {
    setPreviewUrl(currentAvatar);
  }, [currentAvatar]);

  // Update avatar in database
  const updateAvatarInDB = async (avatarUrl) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:8000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ avt_url: avatarUrl })
      });

      if (!response.ok) {
        throw new Error('Failed to update avatar in database');
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

    try {
      setUploading(true);
      
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload file using ApiService
      const uploadResult = await ApiService.uploadFile(file);
      
      if (uploadResult.status === 'success' && uploadResult.data) {
        const avatarUrl = uploadResult.data.url;
        
        // Update avatar in database
        await updateAvatarInDB(avatarUrl);
        
        // Update AuthContext with new avatar
        if (authUser) {
          updateUser({
            ...authUser,
            avatar_url: avatarUrl,
            avt_url: avatarUrl
          });
        }
        
        setPreviewUrl(avatarUrl);
        onAvatarChange(avatarUrl);
        alert('Avatar updated successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      alert('Failed to upload avatar: ' + error.message);
      setPreviewUrl(currentAvatar); // Reset to original
    } finally {
      setUploading(false);
    }
  };

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
          />
        ) : (
          <span className={`${iconSizes[size]} text-gray-400 font-semibold`}>
            👤
          </span>
        )}
        
        {/* Upload overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
          <span className="text-white text-xs font-medium">
            {uploading ? '...' : 'Change'}
          </span>
        </div>
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
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
