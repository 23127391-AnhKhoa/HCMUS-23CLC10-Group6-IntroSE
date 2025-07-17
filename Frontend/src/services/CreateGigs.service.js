// src/services/apiService.js

class ApiService {
  // Helper method to get auth headers
  static getAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Upload file
  static async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const headers = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('Uploading to:', `http://localhost:8000/api/upload`);
      const response = await fetch(`http://localhost:8000/api/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();
      console.log('Upload API response:', data);

      if (!response.ok) {
        throw new Error(data.message || `Upload failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  // Upload multiple files
  static async uploadMultipleFiles(files) {
    try {
      const formData = new FormData();
      
      // Append each file to FormData
      files.forEach(file => {
        formData.append('files', file);
      });

      const token = localStorage.getItem('token');
      const headers = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('Uploading multiple files to:', `http://localhost:8000/api/upload/multiple`);
      const response = await fetch(`http://localhost:8000/api/upload/multiple`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();
      console.log('Multiple upload API response:', data);

      if (!response.ok) {
        throw new Error(data.message || `Multiple upload failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Multiple upload error:', error);
      throw error;
    }
  }

  // Upload files with fields (cover + gallery + videos)
  static async uploadFilesWithFields(filesObject) {
    try {
      const formData = new FormData();
      
      // Append cover image
      if (filesObject.cover_image) {
        formData.append('cover_image', filesObject.cover_image);
      }

      // Append gallery images
      if (filesObject.gallery_images && filesObject.gallery_images.length > 0) {
        filesObject.gallery_images.forEach(file => {
          formData.append('gallery_images', file);
        });
      }

      // Append videos
      if (filesObject.videos && filesObject.videos.length > 0) {
        filesObject.videos.forEach(file => {
          formData.append('videos', file);
        });
      }

      const token = localStorage.getItem('token');
      const headers = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('Uploading files with fields to:', `http://localhost:8000/apiASE_URL}/upload/fields`);
      const response = await fetch(`http://localhost:8000/api/upload/fields`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();
      console.log('Fields upload API response:', data);

      if (!response.ok) {
        throw new Error(data.message || `Fields upload failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Fields upload error:', error);
      throw error;
    }
  }

  // Create gig
  static async createGig(gigData) {
    try {
      const response = await fetch(`http://localhost:8000/api/gigs`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(gigData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create gig');
      }

      return data;
    } catch (error) {
      console.error('Create gig error:', error);
      throw error;
    }
  }

  // Get all gigs
  static async getAllGigs(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `http://localhost:8000/api/gigs${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch gigs');
      }

      return data;
    } catch (error) {
      console.error('Get gigs error:', error);
      throw error;
    }
  }

  // Get gig by ID
  static async getGigById(id) {
    try {
      const response = await fetch(`http://localhost:8000/api/gigs/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch gig');
      }

      return data;
    } catch (error) {
      console.error('Get gig error:', error);
      throw error;
    }
  }

  // Create gig media
  static async createGigMedia(gigId, mediaData) {
    try {
      const response = await fetch(`http://localhost:8000/api/gigs/${gigId}/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mediaData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create gig media');
      }

      return data;
    } catch (error) {
      console.error('Create gig media error:', error);
      throw error;
    }
  }
}

export default ApiService;