# 🚀 Quick Start - Upload API Usage Guide

## 📋 **TL;DR - Cách sử dụng nhanh**

### **1. Import Upload Components**
```jsx
// Import components
import MediaUpload from '../components/MediaUpload/MediaUpload';
import MultipleMediaUpload from '../components/MediaUpload/MultipleMediaUpload';
```

### **2. Basic Usage - Single File**
```jsx
const [uploadedFile, setUploadedFile] = useState(null);

const handleUploadSuccess = (result) => {
  setUploadedFile(result.url);
  console.log('File uploaded:', result.url);
};

// Component JSX
<MediaUpload 
  onFileUpload={handleUploadSuccess}
  onUploadError={(error) => console.error(error)}
  acceptedTypes="image/*"
/>
```

### **3. Basic Usage - Multiple Files**
```jsx
const [uploadedFiles, setUploadedFiles] = useState([]);

const handleMultipleUploadSuccess = (results) => {
  const urls = results.map(r => r.url);
  setUploadedFiles(urls);
};

// Component JSX
<MultipleMediaUpload
  onFilesUpload={handleMultipleUploadSuccess}
  onUploadError={(error) => console.error(error)}
  maxFiles={5}
  allowImages={true}
  allowVideos={true}
/>
```

---

## 🔧 **Sử dụng trong các tính năng cụ thể**

### **1. Profile Avatar Upload**
```jsx
import React, { useState } from 'react';
import MediaUpload from '../components/MediaUpload/MediaUpload';

const ProfileSettings = () => {
  const [avatarUrl, setAvatarUrl] = useState('');

  const handleAvatarUpload = (result) => {
    setAvatarUrl(result.url);
    // Update user profile in database
    updateUserProfile({ avatar: result.url });
  };

  return (
    <div>
      <h3>Update Avatar</h3>
      <MediaUpload 
        onFileUpload={handleAvatarUpload}
        acceptedTypes="image/*"
      />
      {avatarUrl && <img src={avatarUrl} alt="Avatar" width="100" />}
    </div>
  );
};
```

### **2. Product/Service Images**
```jsx
import React, { useState } from 'react';
import MultipleMediaUpload from '../components/MediaUpload/MultipleMediaUpload';

const ProductForm = () => {
  const [productImages, setProductImages] = useState([]);

  const handleImagesUpload = (results) => {
    const imageUrls = results.map(r => r.url);
    setProductImages(prev => [...prev, ...imageUrls]);
  };

  return (
    <div>
      <h3>Product Images</h3>
      <MultipleMediaUpload
        onFilesUpload={handleImagesUpload}
        maxFiles={8}
        allowImages={true}
        allowVideos={false}
        existingFiles={productImages}
      />
    </div>
  );
};
```

### **3. Chat/Message Attachments**
```jsx
import React, { useState } from 'react';
import MediaUpload from '../components/MediaUpload/MediaUpload';

const ChatMessage = () => {
  const [attachment, setAttachment] = useState(null);

  const handleAttachmentUpload = (result) => {
    setAttachment({
      url: result.url,
      type: result.fileType,
      name: result.fileName
    });
  };

  const sendMessage = () => {
    const messageData = {
      text: messageText,
      attachment: attachment,
      timestamp: new Date()
    };
    // Send message with attachment
    sendChatMessage(messageData);
  };

  return (
    <div>
      <MediaUpload 
        onFileUpload={handleAttachmentUpload}
        acceptedTypes="image/*,video/*,.pdf,.doc,.docx"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};
```

### **4. Document Upload**
```jsx
const DocumentUpload = () => {
  const [documents, setDocuments] = useState([]);

  const handleDocumentUpload = (result) => {
    const newDoc = {
      id: Date.now(),
      name: result.fileName,
      url: result.url,
      size: result.fileSize,
      uploadedAt: new Date()
    };
    setDocuments(prev => [...prev, newDoc]);
  };

  return (
    <MediaUpload 
      onFileUpload={handleDocumentUpload}
      acceptedTypes=".pdf,.doc,.docx,.txt"
    />
  );
};
```

---

## 🎯 **API Calls trực tiếp (không dùng components)**

### **Fetch API - Single Upload**
```javascript
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    const result = await response.json();
    if (result.status === 'success') {
      return result.data.url;
    }
    throw new Error(result.message);
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

// Usage
const fileUrl = await uploadFile(selectedFile);
```

### **Axios - Multiple Upload**
```javascript
import axios from 'axios';

const uploadMultipleFiles = async (files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  try {
    const response = await axios.post('/api/upload/multiple', formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.data; // Array of upload results
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

// Usage
const uploadResults = await uploadMultipleFiles([file1, file2, file3]);
```

---

## 🔄 **Integration với State Management**

### **Redux/Context Usage**
```jsx
// uploadSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const uploadFile = createAsyncThunk(
  'upload/uploadFile',
  async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    
    const result = await response.json();
    if (result.status !== 'success') {
      throw new Error(result.message);
    }
    
    return result.data;
  }
);

// Component usage
import { useDispatch } from 'react-redux';
import { uploadFile } from './uploadSlice';

const MyComponent = () => {
  const dispatch = useDispatch();

  const handleFileUpload = (file) => {
    dispatch(uploadFile(file));
  };

  return (
    <MediaUpload onFileUpload={handleFileUpload} />
  );
};
```

---

## ⚡ **Props Quick Reference**

### **MediaUpload Props**
```jsx
<MediaUpload 
  onFileUpload={(result) => {}}        // Required: Success callback
  onUploadError={(error) => {}}        // Optional: Error callback
  acceptedTypes="image/*"              // Optional: File types
  maxSize={50 * 1024 * 1024}          // Optional: Max size (50MB default)
  placeholder="Upload your file"       // Optional: Custom text
/>
```

### **MultipleMediaUpload Props**
```jsx
<MultipleMediaUpload
  onFilesUpload={(results) => {}}      // Required: Success callback
  onUploadError={(error) => {}}        // Optional: Error callback
  maxFiles={10}                        // Optional: Max files (10 default)
  allowImages={true}                   // Optional: Allow images
  allowVideos={true}                   // Optional: Allow videos
  existingFiles={[]}                   // Optional: Already uploaded files
/>
```

---

## 🚨 **Common Patterns & Best Practices**

### **1. Loading States**
```jsx
const [uploading, setUploading] = useState(false);

const handleUpload = async (file) => {
  setUploading(true);
  try {
    const result = await uploadFile(file);
    // Handle success
  } catch (error) {
    // Handle error
  } finally {
    setUploading(false);
  }
};
```

### **2. Error Handling**
```jsx
const [uploadError, setUploadError] = useState(null);

const handleUploadError = (error) => {
  setUploadError(error);
  // Show error toast
  toast.error(`Upload failed: ${error}`);
};

<MediaUpload 
  onFileUpload={handleUploadSuccess}
  onUploadError={handleUploadError}
/>
```

### **3. File Validation**
```jsx
const validateFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png'];
  
  if (file.size > maxSize) {
    throw new Error('File too large');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  return true;
};
```

---

## 📱 **Ready-to-use Examples**

Copy-paste này vào component của bạn:

### **Simple Image Uploader**
```jsx
import React, { useState } from 'react';
import MediaUpload from '../components/MediaUpload/MediaUpload';

const SimpleImageUpload = ({ onImageUploaded }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = (result) => {
    setImageUrl(result.url);
    onImageUploaded?.(result.url);
  };

  return (
    <div>
      <MediaUpload 
        onFileUpload={handleUpload}
        acceptedTypes="image/*"
      />
      {imageUrl && (
        <img src={imageUrl} alt="Uploaded" className="w-32 h-32 object-cover mt-2" />
      )}
    </div>
  );
};

// Usage
<SimpleImageUpload onImageUploaded={(url) => console.log('Image:', url)} />
```

### **Gallery Uploader**
```jsx
import React, { useState } from 'react';
import MultipleMediaUpload from '../components/MediaUpload/MultipleMediaUpload';

const GalleryUpload = ({ onGalleryUpdated }) => {
  const [gallery, setGallery] = useState([]);

  const handleUpload = (results) => {
    const newImages = results.map(r => r.url);
    setGallery(prev => [...prev, ...newImages]);
    onGalleryUpdated?.(gallery);
  };

  return (
    <div>
      <MultipleMediaUpload
        onFilesUpload={handleUpload}
        maxFiles={8}
        allowImages={true}
        allowVideos={false}
      />
      <div className="grid grid-cols-4 gap-2 mt-4">
        {gallery.map((url, index) => (
          <img key={index} src={url} className="w-20 h-20 object-cover" />
        ))}
      </div>
    </div>
  );
};

// Usage
<GalleryUpload onGalleryUpdated={(images) => setProductImages(images)} />
```

**💡 Tip**: Import components này vào bất kỳ đâu và sử dụng ngay! 🚀
