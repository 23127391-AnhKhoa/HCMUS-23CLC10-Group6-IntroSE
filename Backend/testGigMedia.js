// Test script to check and populate GigMedia table
const supabase = require('./config/supabaseClient');

async function testGigMedia() {
    try {
        console.log('🔍 Testing GigMedia table...');
        
        // First, let's check if the table exists by trying to select from it
        const { data, error } = await supabase
            .from('GigMedia')
            .select('*')
            .limit(1);
            
        if (error) {
            console.error('❌ Error accessing GigMedia table:', error);
            
            // If table doesn't exist, let's try to create it
            console.log('🏗️ Attempting to create GigMedia table...');
            
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS "GigMedia" (
                    id BIGSERIAL PRIMARY KEY,
                    gig_id UUID NOT NULL,
                    media_type VARCHAR(50),
                    url TEXT NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `;
            
            const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableQuery });
            
            if (createError) {
                console.error('❌ Error creating table:', createError);
            } else {
                console.log('✅ GigMedia table created successfully');
            }
        } else {
            console.log('✅ GigMedia table exists');
            console.log('📊 Current data:', data);
        }
        
        // Let's also get a sample gig ID to test with
        const { data: gigs, error: gigError } = await supabase
            .from('Gigs')
            .select('id')
            .limit(1);
            
        if (gigError) {
            console.error('❌ Error fetching gigs:', gigError);
        } else if (gigs && gigs.length > 0) {
            const gigId = gigs[0].id;
            console.log('🎯 Sample gig ID:', gigId);
            
            // Check if there's any media for this gig
            const { data: mediaData, error: mediaError } = await supabase
                .from('GigMedia')
                .select('*')
                .eq('gig_id', gigId);
                
            if (mediaError) {
                console.error('❌ Error fetching gig media:', mediaError);
            } else {
                console.log(`📸 Media for gig ${gigId}:`, mediaData);
                
                // If no media exists, let's create some sample media
                if (!mediaData || mediaData.length === 0) {
                    console.log('➕ Creating sample media for gig...');
                    
                    const sampleMedia = [
                        {
                            gig_id: gigId,
                            media_type: 'image',
                            url: 'https://picsum.photos/800/600?random=1'
                        },
                        {
                            gig_id: gigId,
                            media_type: 'image',
                            url: 'https://picsum.photos/800/600?random=2'
                        },
                        {
                            gig_id: gigId,
                            media_type: 'image',
                            url: 'https://picsum.photos/800/600?random=3'
                        }
                    ];
                    
                    const { data: insertedMedia, error: insertError } = await supabase
                        .from('GigMedia')
                        .insert(sampleMedia)
                        .select();
                        
                    if (insertError) {
                        console.error('❌ Error inserting sample media:', insertError);
                    } else {
                        console.log('✅ Sample media created:', insertedMedia);
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

testGigMedia();
