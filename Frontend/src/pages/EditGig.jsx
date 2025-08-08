import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NavBar_Seller from '../Common/NavBar_Seller';
import Footer from '../Common/Footer';
import MediaUpload from '../components/MediaUpload/MediaUpload';
import MultipleMediaUpload from '../components/MediaUpload/MultipleMediaUpload';

const EditGig = () => {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const { authUser, token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [uploadingCover, setUploadingCover] = useState(false);
  const [gigMedia, setGigMedia] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const descriptionRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    delivery_days: 7,
    num_of_edits: 3,
    response_time_hours: 72,
    category_id: '',
    cover_image: '',
    status: 'active'
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/categories');
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setCategories(data.data || []);
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch gig data
  const fetchGig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/gigs/${gigId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch gig: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        const gig = data.data;
        
        // Check if user owns this gig
        if (gig.owner_id !== authUser?.uuid) {
          setError('You can only edit your own gigs');
          return;
        }

        setFormData({
          title: gig.title || '',
          description: gig.description || '',
          price: gig.price || '',
          delivery_days: gig.delivery_days || 7,
          num_of_edits: gig.num_of_edits || 3,
          response_time_hours: gig.response_time_hours || 72,
          category_id: gig.category_id || '',
          cover_image: gig.cover_image || '',
          status: gig.status || 'active'
        });
        
        // Fetch gig media after setting main gig data
        await fetchGigMedia();
      } else {
        throw new Error(data.message || 'Failed to fetch gig');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch gig media
  const fetchGigMedia = async () => {
    try {
      setLoadingMedia(true);
      const response = await fetch(`http://localhost:8000/api/gigs/${gigId}/media`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setGigMedia(data.data || []);
        }
      }
    } catch (err) {
      console.error('Error fetching gig media:', err);
    } finally {
      setLoadingMedia(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (saving) return;

    try {
      setSaving(true);

      // Validation
      if (!formData.title.trim()) {
        showToast('Title is required', 'error');
        return;
      }
      if (!formData.description.trim()) {
        showToast('Description is required', 'error');
        return;
      }
      if (!formData.price || parseFloat(formData.price) < 1) {
        showToast('Price must be at least $1', 'error');
        return;
      }

      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        delivery_days: parseInt(formData.delivery_days),
        num_of_edits: parseInt(formData.num_of_edits),
        response_time_hours: parseInt(formData.response_time_hours),
        category_id: parseInt(formData.category_id),
        cover_image: formData.cover_image,
        status: formData.status
      };

      const response = await fetch(`http://localhost:8000/api/gigs/${gigId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update gig: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        showToast('Gig updated successfully!');
        setTimeout(() => {
          navigate('/manage-gigs');
        }, 1500);
      } else {
        throw new Error(data.message || 'Failed to update gig');
      }
    } catch (err) {
      showToast('Error updating gig: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-resize textarea for description
    if (name === 'description' && descriptionRef.current) {
      autoResizeTextarea();
    }
  };

  // Auto-resize textarea function
  const autoResizeTextarea = () => {
    const textarea = descriptionRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(textarea.scrollHeight, 120)}px`;
    }
  };

  // Handle cover image upload success
  const handleCoverUploadSuccess = (uploadResult) => {
    setFormData(prev => ({
      ...prev,
      cover_image: uploadResult.url
    }));
    setUploadingCover(false);
    showToast('Cover image uploaded successfully!');
  };

  // Handle cover image upload error
  const handleCoverUploadError = (errorMessage) => {
    setUploadingCover(false);
    showToast('Failed to upload cover image: ' + errorMessage, 'error');
  };

  // Remove cover image
  const removeCoverImage = () => {
    setFormData(prev => ({
      ...prev,
      cover_image: ''
    }));
  };

  // Handle gig media upload success
  const handleMediaUploadSuccess = async (uploadResults) => {
    try {
      // uploadResults is an array of uploaded files from MultipleMediaUpload
      const mediaEntries = uploadResults.map(result => ({
        gig_id: gigId,
        media_type: result.type || (result.url.includes('.mp4') || result.url.includes('.mov') ? 'video' : 'image'),
        url: result.url
      }));

      // Create media entries in backend
      for (const mediaEntry of mediaEntries) {
        const response = await fetch(`http://localhost:8000/api/gigs/${gigId}/media`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mediaEntry),
        });

        if (!response.ok) {
          throw new Error(`Failed to save media: ${response.status}`);
        }
      }

      // Refresh gig media
      await fetchGigMedia();
      showToast(`${mediaEntries.length} media file(s) uploaded successfully!`);
    } catch (err) {
      showToast('Failed to save media: ' + err.message, 'error');
    }
  };

  // Handle gig media upload error
  const handleMediaUploadError = (errorMessage) => {
    showToast('Failed to upload media: ' + errorMessage, 'error');
  };

  // Remove gig media
  const removeGigMedia = async (mediaId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/gigs/${gigId}/media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete media: ${response.status}`);
      }

      // Refresh gig media
      await fetchGigMedia();
      showToast('Media deleted successfully!');
    } catch (err) {
      showToast('Failed to delete media: ' + err.message, 'error');
    }
  };

  useEffect(() => {
    if (!authUser || !token) {
      navigate('/auth');
      return;
    }
    fetchCategories();
    fetchGig();
  }, [gigId, authUser, token]);

  // Auto-resize description textarea when component mounts or formData changes
  useEffect(() => {
    if (formData.description && descriptionRef.current) {
      autoResizeTextarea();
    }
  }, [formData.description]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar_Seller />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar_Seller />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => navigate('/manage-gigs')}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
            >
              Back to Manage Gigs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar_Seller />
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{toast.message}</span>
            <button 
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Gig</h1>
                <p className="text-gray-600 mt-2">Update your gig details</p>
              </div>
              <button
                onClick={() => navigate('/manage-gigs')}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                ← Back to Manage Gigs
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gig Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="I will do something amazing..."
                  required
                />
              </div>

              {/* Description - Auto-resizing textarea */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  ref={descriptionRef}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y overflow-hidden"
                  placeholder="Describe your service in detail..."
                  style={{ minHeight: '150px' }}
                  rows={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length} characters
                </p>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="1"
                  step="0.01"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="5.00"
                  required
                />
              </div>

              {/* Delivery Days */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Delivery Days *
                </label>
                <select
                  name="delivery_days"
                  value={formData.delivery_days}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  {[1, 2, 3, 5, 7, 10, 14, 21, 30].map(days => (
                    <option key={days} value={days}>
                      {days} {days === 1 ? 'day' : 'days'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Number of Edits */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Revisions
                </label>
                <select
                  name="num_of_edits"
                  value={formData.num_of_edits}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {[0, 1, 2, 3, 5, 10].map(num => (
                    <option key={num} value={num}>
                      {num === 0 ? 'No revisions' : `${num} revision${num > 1 ? 's' : ''}`}
                    </option>
                  ))}
                  <option value={-1}>Unlimited revisions</option>
                </select>
              </div>

              {/* Response Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Response Time (hours)
                </label>
                <select
                  name="response_time_hours"
                  value={formData.response_time_hours}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value={1}>1 hour</option>
                  <option value={6}>6 hours</option>
                  <option value={12}>12 hours</option>
                  <option value={24}>24 hours</option>
                  <option value={48}>48 hours</option>
                  <option value={72}>72 hours</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cover Image Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cover Image
                </label>
                
                {formData.cover_image ? (
                  <div className="space-y-4">
                    {/* Image Preview */}
                    <div className="relative inline-block group">
                      <img
                        src={formData.cover_image}
                        alt="Cover preview"
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+Image';
                        }}
                      />
                      <button
                        type="button"
                        onClick={removeCoverImage}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove cover image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Upload new image button */}
                    <div className="w-full max-w-md">
                      <MediaUpload 
                        onFileUpload={handleCoverUploadSuccess}
                        onUploadError={handleCoverUploadError}
                        acceptedTypes="image/*"
                      />
                    </div>
                  </div>
                ) : (
                  /* Upload area when no image */
                  <div className="w-full max-w-md">
                    <MediaUpload 
                      onFileUpload={handleCoverUploadSuccess}
                      onUploadError={handleCoverUploadError}
                      acceptedTypes="image/*"
                    />
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  Recommended size: 1200x630px. Max file size: 50MB.
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Gig Media Gallery */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Media Gallery (Images & Videos)
                </label>
                
                {/* Existing Media Display */}
                {gigMedia.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">Current Media ({gigMedia.length})</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {gigMedia.map((media) => (
                        <div key={media.id} className="relative group">
                          {media.media_type === 'video' ? (
                            <div className="relative">
                              <video
                                src={media.url}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                controls={false}
                                muted
                                playsInline
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={media.url}
                              alt="Gig media"
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/200x128?text=Invalid+Image';
                              }}
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => removeGigMedia(media.id)}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove media"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload New Media */}
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-3">Add New Media</h4>
                  <MultipleMediaUpload
                    onFilesUpload={handleMediaUploadSuccess}
                    onUploadError={handleMediaUploadError}
                    maxFiles={5}
                    allowImages={true}
                    allowVideos={true}
                    existingFiles={gigMedia}
                  />
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Upload up to 5 images or videos to showcase your gig. Max file size: 20MB per file.
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/manage-gigs')}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EditGig;
