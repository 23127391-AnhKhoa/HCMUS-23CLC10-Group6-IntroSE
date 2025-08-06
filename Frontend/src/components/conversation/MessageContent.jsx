// src/components/conversation/MessageContent.jsx
import React from 'react';
import { 
  DocumentIcon, 
  PhotoIcon,
  ArrowDownTrayIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

const MessageContent = ({ content, isOwnMessage }) => {
  // Check if content is a URL (either file URL or regular link)
  const isUrl = content && (
    content.startsWith('http://') || content.startsWith('https://')
  );

  // Check if it's a file URL from our storage
  const isFileUrl = isUrl && (
    content.includes('/storage/') || content.includes('supabase')
  );

  // Check if it's a regular web link (not a file)
  const isWebLink = isUrl && !isFileUrl;

  if (!isUrl) {
    // Regular text message
    return <p className="text-sm">{content}</p>;
  }

  if (isWebLink) {
    // Handle regular web links (Google Drive, etc.)
    return (
      <div 
        onClick={() => window.open(content, '_blank')}
        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
          isOwnMessage 
            ? 'bg-blue-400 hover:bg-blue-300' 
            : 'bg-gray-100 hover:bg-gray-50'
        }`}
      >
        <div className={`p-2 rounded-lg ${
          isOwnMessage ? 'bg-blue-300' : 'bg-gray-200'
        }`}>
          <LinkIcon className="h-6 w-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${
            isOwnMessage ? 'text-white' : 'text-gray-900'
          }`}>
            {content.length > 50 ? `${content.substring(0, 50)}...` : content}
          </p>
          <p className={`text-xs ${
            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
          }`}>
            Click to open link
          </p>
        </div>
      </div>
    );
  }

  // Extract filename from URL
  const getFileName = (url) => {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      // Remove any query parameters
      return fileName.split('?')[0];
    } catch {
      return 'Downloaded file';
    }
  };

  // Check file type based on extension
  const getFileType = (filename) => {
    const extension = filename.toLowerCase().split('.').pop();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico'].includes(extension)) {
      return 'image';
    } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', '3gp', 'quicktime'].includes(extension)) {
      return 'video';
    } else if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'wma', 'm4a'].includes(extension)) {
      return 'audio';
    } else if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
      return 'document';
    }
    return 'file';
  };

  const fileName = getFileName(content);
  const fileType = getFileType(fileName);

  const handleDownload = async () => {
    try {
      // Create a temporary link to download the file
      const response = await fetch(content);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(content, '_blank');
    }
  };

  // Render based on file type
  if (fileType === 'image') {
    return (
      <div className="space-y-2">
        <img 
          src={content} 
          alt={fileName}
          className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          style={{ maxHeight: '200px', maxWidth: '250px' }}
          onClick={() => window.open(content, '_blank')}
        />
        <div className="flex items-center justify-between">
          <p className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-600'}`}>
            {fileName}
          </p>
          <button
            onClick={handleDownload}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              isOwnMessage 
                ? 'bg-blue-400 hover:bg-blue-300 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Download
          </button>
        </div>
      </div>
    );
  }

  if (fileType === 'video') {
    return (
      <div className="space-y-2">
        <video 
          src={content}
          controls
          className="max-w-full h-auto rounded-lg"
          style={{ maxHeight: '200px', maxWidth: '250px' }}
        >
          Your browser does not support the video tag.
        </video>
        <div className="flex items-center justify-between">
          <p className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-600'}`}>
            {fileName}
          </p>
          <button
            onClick={handleDownload}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              isOwnMessage 
                ? 'bg-blue-400 hover:bg-blue-300 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Download
          </button>
        </div>
      </div>
    );
  }

  if (fileType === 'audio') {
    return (
      <div className="space-y-2">
        <audio 
          src={content}
          controls
          className="w-full max-w-sm"
        >
          Your browser does not support the audio tag.
        </audio>
        <div className="flex items-center justify-between">
          <p className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-600'}`}>
            {fileName}
          </p>
          <button
            onClick={handleDownload}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              isOwnMessage 
                ? 'bg-blue-400 hover:bg-blue-300 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Download
          </button>
        </div>
      </div>
    );
  }

  if (fileType === 'video') {
    return (
      <div className="space-y-2">
        <video 
          src={content}
          controls
          className="max-w-full h-auto rounded-lg"
          style={{ maxHeight: '200px', maxWidth: '250px' }}
        >
          Your browser does not support the video tag.
        </video>
        <div className="flex items-center justify-between">
          <p className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-600'}`}>
            {fileName}
          </p>
          <button
            onClick={handleDownload}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              isOwnMessage 
                ? 'bg-blue-400 hover:bg-blue-300 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Download
          </button>
        </div>
      </div>
    );
  }

  if (fileType === 'audio') {
    return (
      <div className="space-y-2">
        <audio 
          src={content}
          controls
          className="w-full max-w-sm"
        >
          Your browser does not support the audio tag.
        </audio>
        <div className="flex items-center justify-between">
          <p className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-600'}`}>
            {fileName}
          </p>
          <button
            onClick={handleDownload}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              isOwnMessage 
                ? 'bg-blue-400 hover:bg-blue-300 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Download
          </button>
        </div>
      </div>
    );
  }

  // For documents and other files
  const getFileIcon = () => {
    switch (fileType) {
      case 'document':
        return <DocumentIcon className="h-6 w-6" />;
      case 'video':
        return <VideoCameraIcon className="h-6 w-6" />;
      case 'audio':
        return <MusicalNoteIcon className="h-6 w-6" />;
      default:
        return <PhotoIcon className="h-6 w-6" />;
    }
  };

  return (
    <div 
      onClick={handleDownload}
      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
        isOwnMessage 
          ? 'bg-blue-400 hover:bg-blue-300' 
          : 'bg-gray-100 hover:bg-gray-50'
      }`}
    >
      <div className={`p-2 rounded-lg ${
        isOwnMessage ? 'bg-blue-300' : 'bg-gray-200'
      }`}>
        {getFileIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${
          isOwnMessage ? 'text-white' : 'text-gray-900'
        }`}>
          {fileName}
        </p>
        <p className={`text-xs ${
          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
        }`}>
          Click to download
        </p>
      </div>
      
      <ArrowDownTrayIcon className={`h-5 w-5 ${
        isOwnMessage ? 'text-blue-100' : 'text-gray-400'
      }`} />
    </div>
  );
};

export default MessageContent;
