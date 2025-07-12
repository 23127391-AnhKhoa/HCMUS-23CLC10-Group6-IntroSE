// Fix storage configuration script
const supabase = require('./config/supabaseClient');

async function fixStorageConfiguration() {
  try {
    console.log('🔧 Fixing Supabase storage configuration...');
    
    // 1. Check existing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('❌ Failed to list buckets:', listError);
      return;
    }
    
    console.log('📦 Current buckets:', buckets.map(b => b.name));
    
    const bucketName = 'gig-media';
    const existingBucket = buckets.find(b => b.name === bucketName);
    
    if (!existingBucket) {
      // 2. Create bucket if not exists
      console.log('🆕 Creating gig-media bucket...');
      const { data: newBucket, error: createError } = await supabase.storage
        .createBucket(bucketName, {
          public: true,
          allowedMimeTypes: [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/avi', 'video/mov', 'video/quicktime'
          ],
          fileSizeLimit: 52428800, // 50MB
        });
      
      if (createError) {
        console.error('❌ Failed to create bucket:', createError);
        return;
      }
      console.log('✅ Bucket created successfully');
    } else {
      console.log('✅ Bucket already exists');
    }
    
    // 3. Test upload with service key (should bypass RLS)
    console.log('🧪 Testing file upload...');
    const testFileName = `test_${Date.now()}.txt`;
    const testContent = Buffer.from('Test upload content');
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(`uploads/${testFileName}`, testContent, {
        contentType: 'text/plain',
        cacheControl: '3600',
        upsert: false,
      });
    
    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
      console.log('🔍 This might be due to RLS policies. Checking...');
      
      // If RLS error, it means we need to handle this differently
      if (uploadError.message.includes('policy') || uploadError.message.includes('RLS')) {
        console.log('⚠️  RLS policy issue detected. Upload should work from frontend with proper auth.');
      }
      return;
    }
    
    console.log('✅ Upload test successful:', uploadData.path);
    
    // 4. Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uploadData.path);
    
    console.log('🔗 Public URL:', urlData.publicUrl);
    
    // 5. Clean up test file
    await supabase.storage
      .from(bucketName)
      .remove([uploadData.path]);
    
    console.log('🧹 Test file cleaned up');
    console.log('🎉 Storage configuration is working properly!');
    
  } catch (error) {
    console.error('💥 Configuration failed:', error);
  }
}

// Run the fix
fixStorageConfiguration().then(() => {
  console.log('Configuration completed');
  process.exit(0);
}).catch(error => {
  console.error('Configuration error:', error);
  process.exit(1);
});
