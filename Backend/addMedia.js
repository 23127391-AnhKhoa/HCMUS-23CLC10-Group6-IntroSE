// Add more diverse media to the gig for better testing
const supabase = require('./config/supabaseClient');

async function addMoreMedia() {
    const gigId = '95ccdaea-2730-4da6-85a1-05596cde2b00';
    
    const additionalMedia = [
        {
            gig_id: gigId,
            media_type: 'image',
            url: 'https://picsum.photos/800/600?random=10'
        },
        {
            gig_id: gigId,
            media_type: 'image', 
            url: 'https://picsum.photos/800/600?random=11'
        },
        {
            gig_id: gigId,
            media_type: 'image',
            url: 'https://picsum.photos/800/600?random=12'
        }
    ];
    
    try {
        const { data, error } = await supabase
            .from('GigMedia')
            .insert(additionalMedia)
            .select();
            
        if (error) {
            console.error('Error:', error);
        } else {
            console.log('Added media:', data);
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

addMoreMedia();
