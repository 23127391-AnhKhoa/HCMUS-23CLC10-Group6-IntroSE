# Hướng Dẫn Chi Tiết: Supabase Storage Setup Từ A-Z

## 🎯 Mục Tiêu
Hướng dẫn từng bước tạo bucket storage trên Supabase và cấu hình code để upload files.

## 📋 Tổng Quan
```
Supabase Storage Flow:
1. Tạo Project → 2. Tạo Bucket → 3. Cấu hình RLS → 4. Setup Code → 5. Test Upload
```

---

## 🔰 BƯỚC 1: Tạo Supabase Project
### 1.3 Lấy thông tin kết nối
```
Vào Settings → API:

✅ LƯU LẠI 2 thông tin này:
- Project URL: https://abcxyz123.supabase.co
- service_role key: eyJhbGciOiJIUzI1NiIs...

⚠️ QUAN TRỌNG: Dùng service_role key, KHÔNG phải anon key!
```

---

## 🗂️ BƯỚC 2: Tạo Storage Bucket

### 2.1 Vào Storage Dashboard
```
Trong Supabase Dashboard:
1. Click "Storage" (sidebar bên trái)
2. Click "Create bucket" 
```

### 2.2 Cấu hình bucket cơ bản
```
Bucket Configuration:
- Bucket name: uploads
- Public bucket: ✅ (BẮT BUỘC check để có public URLs)
- File size limit: 10MB (có thể điều chỉnh)
- Allowed file types: Để trống (accept all)

→ Click "Create bucket"
```

### 2.3 Tạo thêm buckets (nếu cần)
```
Bucket "avatar":
- Name: avatar
- Public: ✅
- Purpose: User avatars

Bucket "documents":  
- Name: documents
- Public: ❌ (private files)
- Purpose: PDFs, contracts
```

---

## 🔐 BƯỚC 3: Cấu Hình Row Level Security (RLS)

### 3.1 Hiểu về Supabase Roles

**Target Roles trong Supabase:**

#### `anon` (Anonymous)
- **Ai:** Người dùng chưa đăng nhập
- **Khi nào dùng:** Cho phép upload công khai (không cần đăng nhập)
- **Ví dụ:** Upload ảnh trong form contact

#### `authenticated` 
- **Ai:** Người dùng đã đăng nhập (có JWT token)
- **Khi nào dùng:** Upload files yêu cầu đăng nhập
- **Ví dụ:** Upload avatar, gig images

#### `service_role`
- **Ai:** Server-side operations
- **Đặc điểm:** Bỏ qua tất cả RLS policies
- **Khi nào dùng:** Backend API, admin tasks
- **⚠️ Cảnh báo:** KHÔNG bao giờ gửi service_role key ra client

#### `supabase_read_only_user`
- **Ai:** Role hệ thống chỉ đọc
- **Khi nào dùng:** Monitoring, analytics

#### `supabase_realtime_admin` & `supabase_replication_admin`
- **Ai:** Role hệ thống cho realtime và replication
- **Khi nào dùng:** Ít khi dùng trong app thường

### 3.2 Tạo RLS Policies

**Vào Database → SQL Editor, chạy từng policy:**

#### Policy 1: Public Read (Ai cũng xem được)
```sql
-- Cho phép mọi người xem files trong bucket "uploads"
CREATE POLICY "Public can view uploads" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'uploads');
```

#### Policy 2: Authenticated Upload (Phải đăng nhập mới upload được)
```sql
-- Chỉ user đăng nhập mới upload được vào "uploads"
CREATE POLICY "Authenticated users can upload" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'uploads');
```

#### Policy 3: User Can Manage Own Files
```sql
-- User chỉ sửa/xóa được files của chính mình
CREATE POLICY "Users can manage own files" 
ON storage.objects 
FOR ALL 
TO authenticated 
USING (auth.uid()::text = (storage.foldername(name))[1]);
```

### 3.3 Policy cho bucket "avatar"
```sql
-- Public read cho avatars
CREATE POLICY "Public can view avatars" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'avatar');

-- Authenticated upload cho avatars
CREATE POLICY "Users can upload avatars" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'avatar');
```

### 3.4 Kiểm tra RLS đã enable
```sql
-- Đảm bảo RLS được bật
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

---

## ⚙️ BƯỚC 4: Setup Backend Code

### 4.1 Tạo Environment File
**Tạo file `Backend/.env`:**
```env
# Supabase Configuration
SUPABASE_URL=https://abcxyz123.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...

# Server Config
PORT=8000
NODE_ENV=development
```

**⚠️ Bảo mật:**
```bash
# Thêm .env vào .gitignore
echo ".env" >> .gitignore
```

### 4.2 Kiểm tra supabaseClient.js
**File `Backend/config/supabaseClient.js` phải có:**
```javascript
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // ← service_role key

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,      // ← Server không cần session
    autoRefreshToken: false,    // ← Server không cần refresh
    detectSessionInUrl: false   // ← Server không có URL session
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'apikey': supabaseKey     // ← Đảm bảo auth header
    }
  }
});

module.exports = supabase;
```

### 4.3 Tạo Upload Service
**File `Backend/services/upload.service.js`:**
```javascript
const supabase = require('../config/supabaseClient');

// Chọn bucket dựa vào purpose
const getBucketName = (purpose) => {
  switch (purpose) {
    case 'avatar': return 'avatar';
    case 'gig': return 'uploads';
    case 'document': return 'documents';
    default: return 'uploads';
  }
};

// Upload single file
const uploadFile = async (fileBuffer, fileName, folder = 'general', purpose = 'gig') => {
  const bucketName = getBucketName(purpose);
  const filePath = `${folder}/${fileName}`;
  
  console.log(`📤 Uploading to bucket: ${bucketName}, path: ${filePath}`);
  
  try {
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType: 'auto', // Tự động detect MIME type
        upsert: false        // Không ghi đè file cũ
      });

    if (error) {
      console.error('❌ Upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Tạo public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    console.log('✅ Upload success:', urlData.publicUrl);
    
    return {
      path: data.path,
      fullPath: data.fullPath,
      url: urlData.publicUrl,
      bucket: bucketName
    };
    
  } catch (error) {
    console.error('❌ Upload service error:', error);
    throw error;
  }
};

// Upload multiple files
const uploadMultipleFiles = async (files, folder = 'general', purpose = 'gig') => {
  const results = [];
  
  for (const file of files) {
    const timestamp = Date.now();
    const fileName = `${folder}_${timestamp}_${file.originalname}`;
    
    const result = await uploadFile(file.buffer, fileName, folder, purpose);
    results.push({
      originalName: file.originalname,
      fileName: fileName,
      size: file.size,
      mimetype: file.mimetype,
      url: result.url
    });
  }
  
  return results;
};

// Delete file
const deleteFile = async (filePath, purpose = 'gig') => {
  const bucketName = getBucketName(purpose);
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .remove([filePath]);
    
  if (error) throw error;
  return data;
};

module.exports = {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  getBucketName
};
```

### 4.4 Tạo Upload Controller  
**File `Backend/controllers/upload.controller.js`:**
```javascript
const uploadService = require('../services/upload.service');

// Upload single file
const uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const { folder = 'general', purpose = 'gig' } = req.body;
    const timestamp = Date.now();
    const fileName = `${folder}_${timestamp}_${req.file.originalname}`;

    const result = await uploadService.uploadFile(
      req.file.buffer,
      fileName,
      folder,
      purpose
    );

    res.json({
      success: true,
      file: {
        originalName: req.file.originalname,
        fileName: fileName,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: result.url,
        bucket: result.bucket
      },
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('❌ Upload controller error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Upload multiple files
const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided'
      });
    }

    const { folder = 'general', purpose = 'gig' } = req.body;
    
    const results = await uploadService.uploadMultipleFiles(
      req.files,
      folder,
      purpose
    );

    res.json({
      success: true,
      files: results,
      message: `${results.length} files uploaded successfully`
    });

  } catch (error) {
    console.error('❌ Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple
};
```

### 4.5 Cấu hình Routes
**File `Backend/routes/upload.routes.js`:**
```javascript
const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/upload.controller');

const router = express.Router();

// Multer configuration
const storage = multer.memoryStorage(); // Lưu file trong memory
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10                    // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    // Kiểm tra file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov',
      'application/pdf', 'application/msword'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Routes
router.post('/single', upload.single('file'), uploadController.uploadSingle);
router.post('/multiple', upload.array('files', 10), uploadController.uploadMultiple);

module.exports = router;
```

### 4.6 Đăng ký Routes trong App
**File `Backend/server.js` hoặc `Backend/app.js`:**
```javascript
const express = require('express');
const uploadRoutes = require('./routes/upload.routes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/upload', uploadRoutes);

// Error handling
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large (max 10MB)'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    message: error.message
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

---

## 🧪 BƯỚC 5: Testing & Verification

### 5.1 Test Connection
```bash
cd Backend

# Test 1: Check environment variables
node -e "
console.log('✅ URL:', process.env.SUPABASE_URL);
console.log('✅ KEY:', process.env.SUPABASE_SERVICE_KEY?.substring(0, 20) + '...');
"

# Test 2: Check bucket connection
node -e "
const supabase = require('./config/supabaseClient');
supabase.storage.listBuckets().then(({data, error}) => {
  if (error) console.log('❌ Error:', error);
  else console.log('✅ Buckets:', data.map(b => b.name));
});
"
```

### 5.2 Test Upload
```bash
# Tạo test file
echo "const supabase = require('./config/supabaseClient');
const test = async () => {
  console.log('🧪 Testing upload...');
  
  const content = Buffer.from('Hello Supabase Storage!');
  const fileName = \`test_\${Date.now()}.txt\`;
  const filePath = \`test/\${fileName}\`;
  
  try {
    // Upload
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filePath, content);
      
    if (error) throw error;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);
      
    console.log('✅ Upload successful!');
    console.log('📁 Path:', data.path);
    console.log('🔗 URL:', urlData.publicUrl);
    
    // Test URL accessibility
    const response = await fetch(urlData.publicUrl);
    if (response.ok) {
      console.log('✅ URL is accessible');
    } else {
      console.log('❌ URL not accessible');
    }
    
    // Cleanup
    await supabase.storage.from('uploads').remove([filePath]);
    console.log('🧹 Cleanup completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};
test();" > test-upload.js

node test-upload.js
```

### 5.3 Test API Endpoints
```bash
# Test single upload (có file image.jpg trong thư mục)
curl -X POST http://localhost:8000/api/upload/single \
  -F "file=@image.jpg" \
  -F "folder=test" \
  -F "purpose=gig"

# Test multiple upload
curl -X POST http://localhost:8000/api/upload/multiple \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg" \
  -F "folder=gallery" \
  -F "purpose=gig"
```

### 5.4 Verification Checklist
```
✅ Environment Setup:
- [ ] .env file có SUPABASE_URL
- [ ] .env file có SUPABASE_SERVICE_KEY
- [ ] .env được thêm vào .gitignore

✅ Supabase Dashboard:
- [ ] Project được tạo thành công
- [ ] Bucket "uploads" tồn tại và public
- [ ] RLS policies được tạo

✅ Backend Code:
- [ ] supabaseClient.js kết nối thành công
- [ ] Upload service hoạt động
- [ ] API endpoints response đúng

✅ Testing:
- [ ] listBuckets() trả về danh sách buckets
- [ ] Upload test file thành công
- [ ] Public URL accessible
- [ ] Cleanup hoạt động
```

---

## 🎯 Kết Quả Cuối Cùng

### URL Structure
```
Bucket "uploads":
https://abcxyz123.supabase.co/storage/v1/object/public/uploads/folder/filename.jpg

Bucket "avatar":
https://abcxyz123.supabase.co/storage/v1/object/public/avatar/profiles/user123.jpg
```

### API Usage
```javascript
// Frontend upload
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'gigs');
formData.append('purpose', 'gig');

const response = await fetch('/api/upload/single', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Upload URL:', result.file.url);
```

### File Organization
```
uploads/
├── gigs/
│   ├── gigs_1641234567_cover.jpg
│   └── gigs_1641234568_gallery.jpg
├── avatars/
│   ├── avatars_1641234569_user123.jpg
│   └── avatars_1641234570_user456.png
└── temp/
    └── temp_1641234571_file.jpg
```

---

## 🚨 Troubleshooting

### Lỗi thường gặp:

#### "Invalid API key"
```bash
# Check key type
node -e "
const key = process.env.SUPABASE_SERVICE_KEY;
if (key.includes('eyJ')) console.log('✅ Valid JWT format');
else console.log('❌ Invalid key format');
"
```

#### "Bucket not found"
```sql
-- Check buckets in SQL Editor
SELECT name, public FROM storage.buckets;
```

#### "RLS policy violation"
```sql
-- Temporarily disable RLS for testing
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
-- Remember to enable again after testing
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

#### "CORS error"
- Đảm bảo bucket là public ✅
- Check frontend origin trong Supabase settings

---

**🎉 Hoàn thành! Storage system đã sẵn sàng upload files!**
