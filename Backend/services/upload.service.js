// backend/services/upload.service.js
const supabase = require('../config/supabaseClient');
const path = require('path');

const uploadFile = async (file) => {
  try {
    console.log('🚀 Starting file upload to Supabase...');
    
    // Tạo tên file unique
    const fileExtension = path.extname(file.originalname);
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}${fileExtension}`;
    const filePath = `uploads/${fileName}`;

    const bucketName = 'gig-media';

    console.log('📝 Upload details:', {
      originalName: file.originalname,
      fileName: fileName,
      filePath: filePath,
      size: file.size,
      type: file.mimetype
    });

    // Upload với service key (bypass RLS)
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('❌ Supabase upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    console.log('✅ File uploaded successfully:', data);

    // Lấy public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('Could not get public URL for the uploaded file.');
    }

    console.log('🔗 Public URL generated:', publicUrlData.publicUrl);
    return {
      url: publicUrlData.publicUrl,
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      path: data.path
    };
  } catch (error) {
    console.error('💥 Upload service error:', error);
    throw new Error(`Supabase upload failed: ${error.message}`);
  }
};

const uploadMultipleFiles = async (files) => {
  try {
    console.log(`🚀 Starting multiple files upload to Supabase... (${files.length} files)`);
    
    const uploadPromises = files.map(file => uploadFile(file));
    const results = await Promise.all(uploadPromises);
    
    console.log('✅ All files uploaded successfully:', results.length);
    return results;
  } catch (error) {
    console.error('💥 Multiple upload service error:', error);
    throw new Error(`Multiple files upload failed: ${error.message}`);
  }
};

const deleteFile = async (filePath) => {
  try {
    console.log('🗑️ Deleting file from Supabase:', filePath);
    
    const bucketName = 'gig-media';
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('❌ Supabase delete error:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }

    console.log('✅ File deleted successfully');
    return true;
  } catch (error) {
    console.error('💥 Delete service error:', error);
    throw new Error(`Supabase delete failed: ${error.message}`);
  }
};

module.exports = {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
};