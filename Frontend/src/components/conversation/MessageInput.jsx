// src/components/conversation/MessageInput.jsx
import React, { useRef, useState } from 'react';
import { 
  PaperClipIcon, 
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import ApiService from '../../services/apiService';

const MessageInput = ({ 
  messageInput, 
  setMessageInput, 
  onSendMessage, 
  messagesLoading
}) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || messagesLoading || uploading) return;
    onSendMessage();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      
      // Upload file using existing upload API
      console.log('Starting file upload:', file.name, file.size);
      const uploadResult = await ApiService.uploadFile(file, 'message');
      console.log('Upload API response:', uploadResult);
      
      // The backend returns: { status: 'success', data: { url: '...', ... } }
      if (uploadResult && uploadResult.data && uploadResult.data.url) {
        console.log('File uploaded successfully, URL:', uploadResult.data.url);
        // Send the file URL as message content
        onSendMessage(uploadResult.data.url);
      } else {
        console.error('Upload result structure:', uploadResult);
        throw new Error('Upload failed - no URL returned');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/*,audio/*"
      />
      
      <div className="flex items-end space-x-3">
        <button 
          onClick={handleAttachClick}
          disabled={uploading || messagesLoading}
          className={`p-2 rounded-full transition-colors ${
            uploading || messagesLoading
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
        >
          <PaperClipIcon className="h-6 w-6" />
        </button>

        <div className="flex-1">
          <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>
        
        <button
          onClick={handleSendMessage}
          disabled={!messageInput.trim() || messagesLoading || uploading}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </div>
      
      {/* Upload progress indicator */}
      {uploading && (
        <div className="mt-2 text-sm text-blue-600 flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Uploading file...</span>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
