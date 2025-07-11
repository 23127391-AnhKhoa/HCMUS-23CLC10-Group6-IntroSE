# Hướng Dẫn Upload File

## 🎯 Mục Đích
Upload hình ảnh, video lên server và nhận URL để hiển thị ngay lập tức.

## 📍 Địa Chỉ API
```
http://localhost:8000/api/upload
```

## 🚀 Bắt Đầu Nhanh

### Bước 1: Cài Đặt (Backend đã có sẵn)
```bash
# Các package đã được cài
npm install multer supabase
```

### Bước 2: Upload 1 File
**Gửi file lên server:**

```javascript
// Chọn file từ input
const file = document.querySelector('input[type="file"]').files[0];

// Tạo form data
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'gigs'); // Thư mục lưu

// Gửi lên server
fetch('http://localhost:8000/api/upload/single', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('URL của file:', data.file.url);
  // Dùng URL này để hiển thị hình ngay
})
.catch(error => console.error('Lỗi:', error));
```

**Kết quả nhận được:**
```json
{
  "success": true,
  "file": {
    "url": "https://abc123.supabase.co/storage/v1/object/public/uploads/gigs_1641234567_photo.jpg"
  }
}
```

### Bước 3: Upload Nhiều Files
```javascript
// Chọn nhiều files
const files = document.querySelector('input[type="file"]').files;

const formData = new FormData();
// Thêm từng file vào form
for (let i = 0; i < files.length; i++) {
  formData.append('files', files[i]);
}
formData.append('folder', 'gallery');

fetch('http://localhost:8000/api/upload/multiple', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('Danh sách URLs:', data.files);
  // data.files là array chứa các URLs
});
```

## 🔧 Sử Dụng Trong React

### Hook Đơn Giản
```javascript
// hooks/useFileUpload.js
import { useState } from 'react';

export const useFileUpload = () => {
  const [loading, setLoading] = useState(false);

  const uploadFile = async (file) => {
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'gigs');

    try {
      const response = await fetch('http://localhost:8000/api/upload/single', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.file.url; // Trả về URL
      } else {
        throw new Error('Upload thất bại');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { uploadFile, loading };
};
```

### Component Upload
```javascript
import React, { useState } from 'react';
import { useFileUpload } from './hooks/useFileUpload';

const UploadComponent = () => {
  const [imageUrl, setImageUrl] = useState('');
  const { uploadFile, loading } = useFileUpload();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const url = await uploadFile(file);
      setImageUrl(url); // Lưu URL để hiển thị
      console.log('Upload thành công:', url);
    } catch (error) {
      alert('Upload thất bại: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Upload Hình Ảnh</h2>
      
      {/* Input chọn file */}
      <input 
        type="file" 
        onChange={handleFileChange}
        accept="image/*"
        disabled={loading}
      />
      
      {/* Hiển thị loading */}
      {loading && <p>Đang upload...</p>}
      
      {/* Hiển thị hình sau khi upload */}
      {imageUrl && (
        <div>
          <h3>Hình đã upload:</h3>
          <img 
            src={imageUrl} 
            alt="Uploaded" 
            style={{ width: '200px', height: 'auto' }}
          />
          <p>URL: {imageUrl}</p>
        </div>
      )}
    </div>
  );
};

export default UploadComponent;
```

## 💡 Cách Sử Dụng URL

### 1. Lưu URL Vào Gig Data
```javascript
// Sau khi upload thành công
const uploadFile = async (file) => {
  const url = await uploadFile(file);
  
  // Lưu vào dữ liệu gig
  setGigData(prev => ({
    ...prev,
    cover_image: url // URL hình đại diện
  }));
};
```

### 2. Hiển thị Hình Ngay Lập Tức
```javascript
const [imageUrl, setImageUrl] = useState('');

const handleUpload = async (file) => {
  const url = await uploadFile(file);
  setImageUrl(url); // Hiển thị ngay
};

return (
  <div>
    {imageUrl && (
      <img src={imageUrl} alt="Preview" width="200" />
    )}
  </div>
);
```

### 3. Upload Nhiều Hình Cho Gallery
```javascript
const [galleryUrls, setGalleryUrls] = useState([]);

const handleMultipleUpload = async (files) => {
  const urls = [];
  
  for (let file of files) {
    const url = await uploadFile(file);
    urls.push(url);
  }
  
  setGalleryUrls(prev => [...prev, ...urls]);
};
```

## 📝 Ví Dụ Thực Tế

### Upload Cover Image Cho Gig
```javascript
const CreateGigForm = () => {
  const [gigData, setGigData] = useState({
    title: '',
    description: '',
    cover_image: '', // URL sẽ được lưu ở đây
    gallery: []      // Array URLs
  });
  
  const { uploadFile, loading } = useFileUpload();

  const handleCoverImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const url = await uploadFile(file);
      
      // Cập nhật cover image
      setGigData(prev => ({
        ...prev,
        cover_image: url
      }));
      
      alert('Upload hình đại diện thành công!');
    } catch (error) {
      alert('Upload thất bại: ' + error.message);
    }
  };

  const handleSubmitGig = async () => {
    // Gửi dữ liệu gig lên server (bao gồm URLs)
    const response = await fetch('/api/gigs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gigData) // URLs đã có sẵn
    });
  };

  return (
    <form>
      <div>
        <label>Hình đại diện:</label>
        <input 
          type="file" 
          onChange={handleCoverImageUpload}
          accept="image/*"
        />
        {loading && <p>Đang upload...</p>}
        
        {/* Preview hình đã upload */}
        {gigData.cover_image && (
          <img 
            src={gigData.cover_image} 
            alt="Cover" 
            width="200" 
          />
        )}
      </div>
      
      <button type="button" onClick={handleSubmitGig}>
        Tạo Gig
      </button>
    </form>
  );
};
```

## ⚠️ Xử Lý Lỗi Đơn Giản

### Các Lỗi Thường Gặp
```javascript
const handleUploadError = (error) => {
  if (error.message.includes('size')) {
    alert('File quá lớn (tối đa 10MB)');
  } else if (error.message.includes('type')) {
    alert('Chỉ hỗ trợ hình ảnh và video');
  } else if (error.message.includes('Network')) {
    alert('Lỗi kết nối. Kiểm tra server có chạy không?');
  } else {
    alert('Có lỗi xảy ra: ' + error.message);
  }
};

// Sử dụng
try {
  const url = await uploadFile(file);
} catch (error) {
  handleUploadError(error);
}
```

### Kiểm Tra File Trước Khi Upload
```javascript
const validateFile = (file) => {
  // Kiểm tra kích thước (10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File quá lớn');
  }
  
  // Kiểm tra loại file
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Loại file không hỗ trợ');
  }
  
  return true;
};

// Sử dụng
const handleFileChange = async (event) => {
  const file = event.target.files[0];
  
  try {
    validateFile(file); // Kiểm tra trước
    const url = await uploadFile(file); // Upload
    console.log('Thành công:', url);
  } catch (error) {
    alert(error.message);
  }
};
```

## 🔧 Khắc Phục Sự Cố

### 1. Lỗi CORS (Không kết nối được)
**Triệu chứng:** Console hiển thị lỗi CORS  
**Giải pháp:** Kiểm tra backend có chạy port 8000 không

```bash
# Kiểm tra backend có chạy không
cd Backend
npm start

# Nếu chạy port khác, sửa URL trong code
# Thay http://localhost:8000 bằng port đúng
```

### 2. File Upload Không Thành Công
**Triệu chứng:** Luôn trả về lỗi  
**Kiểm tra:**
- File có đúng định dạng không? (JPG, PNG, MP4...)
- File có quá lớn không? (>10MB)
- Kết nối internet có ổn định không?

### 3. URL Không Hiển thị Được Hình
**Triệu chứng:** URL có nhưng không load được hình  
**Kiểm tra:**
- URL có đúng format không?
- Supabase có hoạt động không?

```javascript
// Test URL
const testUrl = (url) => {
  const img = new Image();
  img.onload = () => console.log('URL OK');
  img.onerror = () => console.log('URL lỗi');
  img.src = url;
};
```

## 📋 Tóm Tắt

### Quy Trình Upload
1. **Chọn file** từ input
2. **Gửi lên server** qua API
3. **Nhận URL** từ response  
4. **Sử dụng URL** để hiển thị hoặc lưu database

### Code Tối Thiểu
```javascript
// Hook upload
const { uploadFile, loading } = useFileUpload();

// Upload và lấy URL
const url = await uploadFile(file);

// Hiển thị hình
<img src={url} alt="Uploaded" />
```

### Lưu Ý Quan Trọng
- ✅ URL nhận được có thể dùng ngay lập tức
- ✅ Không cần lưu file ở máy local
- ✅ File được lưu vĩnh viễn trên Supabase
- ⚠️ Đảm bảo backend chạy port 8000
- ⚠️ Kiểm tra kích thước file < 10MB

## 🎨 Ứng Dụng Thực Tế Trong Dự Án

### 1. 🖼️ Upload Avatar User
**Sử dụng:** Trang Profile, Đăng ký tài khoản

```javascript
// components/AvatarUpload.jsx
import React, { useState } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';

const AvatarUpload = ({ currentAvatar, onAvatarChange }) => {
  const [preview, setPreview] = useState(currentAvatar);
  const { uploadFile, loading } = useFileUpload();

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Kiểm tra file
    if (file.size > 2 * 1024 * 1024) { // 2MB
      alert('Avatar không được quá 2MB');
      return;
    }

    try {
      const url = await uploadFile(file);
      setPreview(url);
      onAvatarChange(url); // Callback để cập nhật user data
    } catch (error) {
      alert('Upload avatar thất bại');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Preview Avatar */}
      <div className="relative">
        <img
          src={preview || '/default-avatar.png'}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
        />
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
        {loading ? 'Đang upload...' : 'Chọn avatar'}
        <input
          type="file"
          onChange={handleAvatarUpload}
          accept="image/*"
          className="hidden"
          disabled={loading}
        />
      </label>
    </div>
  );
};

export default AvatarUpload;
```

### 2. 🎯 Upload Cover Image Gig
**Sử dụng:** Trang tạo Gig, chỉnh sửa Gig

```javascript
// components/GigCoverUpload.jsx
import React, { useState } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';

const GigCoverUpload = ({ onCoverChange, currentCover }) => {
  const [coverUrl, setCoverUrl] = useState(currentCover);
  const { uploadFile, loading } = useFileUpload();

  const handleCoverUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const url = await uploadFile(file);
      setCoverUrl(url);
      onCoverChange(url);
    } catch (error) {
      alert('Upload cover image thất bại');
    }
  };

  const removeCover = () => {
    setCoverUrl('');
    onCoverChange('');
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Hình đại diện Gig (1200x630px khuyến nghị)
      </label>
      
      {!coverUrl ? (
        // Upload Area
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click để upload</span> hoặc kéo thả file
            </p>
            <p className="text-xs text-gray-500">PNG, JPG hoặc GIF (MAX. 5MB)</p>
          </div>
          <input
            type="file"
            onChange={handleCoverUpload}
            accept="image/*"
            className="hidden"
            disabled={loading}
          />
        </label>
      ) : (
        // Preview Area
        <div className="relative">
          <img
            src={coverUrl}
            alt="Gig Cover"
            className="w-full h-64 object-cover rounded-lg"
          />
          <button
            onClick={removeCover}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2">Đang upload cover image...</span>
        </div>
      )}
    </div>
  );
};

export default GigCoverUpload;
```

### 3. 🖼️ Upload Gallery Gig
**Sử dụng:** Trang tạo Gig để hiển thị portfolio

```javascript
// components/GigGalleryUpload.jsx
import React, { useState } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';

const GigGalleryUpload = ({ onGalleryChange, currentGallery = [] }) => {
  const [gallery, setGallery] = useState(currentGallery);
  const { uploadFile, loading } = useFileUpload();

  const handleFilesUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Kiểm tra số lượng (tối đa 10 hình)
    if (gallery.length + files.length > 10) {
      alert('Tối đa 10 hình trong gallery');
      return;
    }

    try {
      const urls = [];
      for (let file of files) {
        const url = await uploadFile(file);
        urls.push(url);
      }
      
      const newGallery = [...gallery, ...urls];
      setGallery(newGallery);
      onGalleryChange(newGallery);
    } catch (error) {
      alert('Upload gallery thất bại');
    }
  };

  const removeImage = (indexToRemove) => {
    const newGallery = gallery.filter((_, index) => index !== indexToRemove);
    setGallery(newGallery);
    onGalleryChange(newGallery);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Gallery Gig ({gallery.length}/10)
      </label>

      {/* Upload Button */}
      <label className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg cursor-pointer hover:bg-green-600">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Thêm hình vào Gallery
        <input
          type="file"
          onChange={handleFilesUpload}
          accept="image/*"
          multiple
          className="hidden"
          disabled={loading || gallery.length >= 10}
        />
      </label>

      {loading && (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          <span className="ml-2 text-sm">Đang upload hình...</span>
        </div>
      )}

      {/* Gallery Grid */}
      {gallery.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Gallery ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GigGalleryUpload;
```

### 4. 📄 Upload Documents/Portfolio
**Sử dụng:** Trang Profile Seller, đính kèm CV

```javascript
// components/DocumentUpload.jsx
import React, { useState } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';

const DocumentUpload = ({ onDocumentsChange, currentDocs = [] }) => {
  const [documents, setDocuments] = useState(currentDocs);
  const { uploadFile, loading } = useFileUpload();

  const handleDocumentUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    try {
      const newDocs = [];
      for (let file of files) {
        // Kiểm tra file type
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
          alert(`File ${file.name} không được hỗ trợ. Chỉ hỗ trợ PDF, DOC, DOCX`);
          continue;
        }

        const url = await uploadFile(file);
        newDocs.push({
          url,
          name: file.name,
          size: file.size,
          type: file.type
        });
      }
      
      const updatedDocs = [...documents, ...newDocs];
      setDocuments(updatedDocs);
      onDocumentsChange(updatedDocs);
    } catch (error) {
      alert('Upload document thất bại');
    }
  };

  const removeDocument = (indexToRemove) => {
    const newDocs = documents.filter((_, index) => index !== indexToRemove);
    setDocuments(newDocs);
    onDocumentsChange(newDocs);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Upload Documents (CV, Portfolio, Certificates)
      </label>

      {/* Upload Area */}
      <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            Click để upload documents
          </p>
          <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 10MB)</p>
        </div>
        <input
          type="file"
          onChange={handleDocumentUpload}
          accept=".pdf,.doc,.docx"
          multiple
          className="hidden"
          disabled={loading}
        />
      </label>

      {loading && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm">Đang upload documents...</span>
        </div>
      )}

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Documents đã upload:</h4>
          {documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Xem
                </a>
                <button
                  onClick={() => removeDocument(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
```

## 📱 Template Tích Hợp Hoàn Chỉnh

### Template 1: Complete Gig Creation Form
```javascript
// pages/CreateGig.jsx
import React, { useState } from 'react';
import GigCoverUpload from '../components/GigCoverUpload';
import GigGalleryUpload from '../components/GigGalleryUpload';

const CreateGigPage = () => {
  const [gigData, setGigData] = useState({
    title: '',
    description: '',
    price: '',
    delivery_days: 7,
    cover_image: '',
    gallery: []
  });

  const handleSubmit = async () => {
    // Validate
    if (!gigData.title || !gigData.description || !gigData.cover_image) {
      alert('Vui lòng điền đầy đủ thông tin và upload cover image');
      return;
    }

    try {
      const response = await fetch('/api/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gigData)
      });

      if (response.ok) {
        alert('Tạo gig thành công!');
        // Redirect to gig detail page
      } else {
        throw new Error('Tạo gig thất bại');
      }
    } catch (error) {
      alert('Có lỗi xảy ra: ' + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Tạo Gig Mới</h1>
      
      <div className="space-y-8">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tiêu đề Gig</label>
            <input
              type="text"
              value={gigData.title}
              onChange={(e) => setGigData(prev => ({...prev, title: e.target.value}))}
              className="w-full p-3 border rounded-lg"
              placeholder="Ví dụ: Tôi sẽ thiết kế logo chuyên nghiệp cho bạn"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mô tả</label>
            <textarea
              value={gigData.description}
              onChange={(e) => setGigData(prev => ({...prev, description: e.target.value}))}
              className="w-full p-3 border rounded-lg h-32"
              placeholder="Mô tả chi tiết về dịch vụ của bạn..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Giá ($)</label>
              <input
                type="number"
                value={gigData.price}
                onChange={(e) => setGigData(prev => ({...prev, price: e.target.value}))}
                className="w-full p-3 border rounded-lg"
                placeholder="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Thời gian hoàn thành (ngày)</label>
              <select
                value={gigData.delivery_days}
                onChange={(e) => setGigData(prev => ({...prev, delivery_days: parseInt(e.target.value)}))}
                className="w-full p-3 border rounded-lg"
              >
                <option value={1}>1 ngày</option>
                <option value={3}>3 ngày</option>
                <option value={7}>1 tuần</option>
                <option value={14}>2 tuần</option>
                <option value={30}>1 tháng</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <GigCoverUpload
          currentCover={gigData.cover_image}
          onCoverChange={(url) => setGigData(prev => ({...prev, cover_image: url}))}
        />

        {/* Gallery */}
        <GigGalleryUpload
          currentGallery={gigData.gallery}
          onGalleryChange={(gallery) => setGigData(prev => ({...prev, gallery}))}
        />

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button 
            type="button"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tạo Gig
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGigPage;
```

### Template 2: User Profile With Avatar & Documents
```javascript
// pages/UserProfile.jsx
import React, { useState } from 'react';
import AvatarUpload from '../components/AvatarUpload';
import DocumentUpload from '../components/DocumentUpload';

const UserProfilePage = () => {
  const [userData, setUserData] = useState({
    username: '',
    fullname: '',
    email: '',
    bio: '',
    avatar: '',
    documents: []
  });

  const handleSave = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        alert('Cập nhật profile thành công!');
      } else {
        throw new Error('Cập nhật thất bại');
      }
    } catch (error) {
      alert('Có lỗi xảy ra: ' + error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Cập Nhật Profile</h1>
      
      <div className="space-y-8">
        {/* Avatar Section */}
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Avatar</h2>
          <AvatarUpload
            currentAvatar={userData.avatar}
            onAvatarChange={(url) => setUserData(prev => ({...prev, avatar: url}))}
          />
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={userData.username}
              onChange={(e) => setUserData(prev => ({...prev, username: e.target.value}))}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Họ tên</label>
            <input
              type="text"
              value={userData.fullname}
              onChange={(e) => setUserData(prev => ({...prev, fullname: e.target.value}))}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={userData.email}
              onChange={(e) => setUserData(prev => ({...prev, email: e.target.value}))}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Giới thiệu bản thân</label>
            <textarea
              value={userData.bio}
              onChange={(e) => setUserData(prev => ({...prev, bio: e.target.value}))}
              className="w-full p-3 border rounded-lg h-24"
              placeholder="Viết một đoạn giới thiệu ngắn về bản thân..."
            />
          </div>
        </div>

        {/* Documents Section */}
        <DocumentUpload
          currentDocs={userData.documents}
          onDocumentsChange={(docs) => setUserData(prev => ({...prev, documents: docs}))}
        />

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Lưu Thay Đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
```

## 🎯 Lợi Ích Của Upload API

### ✅ **Cho Developer**
- Code đơn giản, dễ implement
- URL trả về sẵn sàng sử dụng ngay
- Không cần quản lý file storage
- Tích hợp dễ dàng với React components

### ✅ **Cho User Experience**
- Upload nhanh chóng
- Preview ngay lập tức
- Không cần refresh page
- Giao diện trực quan

### ✅ **Cho Hệ Thống**
- Files được lưu an toàn trên Supabase
- URL có thể truy cập từ mọi nơi
- Backup tự động
- Performance tốt với CDN

---

**🎯 Mục tiêu:** Hiểu cách upload file và sử dụng URL một cách đơn giản nhất!
