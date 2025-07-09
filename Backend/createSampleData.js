const supabase = require('./config/supabaseClient');
const Conversation = require('./models/conversation.model');
const Message = require('./models/message.model');

async function createSampleData() {
  try {
    console.log('Creating sample conversation and messages...');
    
    // Get existing users
    const { data: users, error: userError } = await supabase
      .from('User')
      .select('uuid, fullname, username')
      .limit(2);
    
    if (userError) throw userError;
    
    if (users.length < 2) {
      console.log('Need at least 2 users in the database to create a conversation');
      console.log('Current users:', users);
      
      // Create a second user if needed
      if (users.length === 1) {
        const { data: newUser, error: createError } = await supabase
          .from('User')
          .insert([{
            fullname: 'Test User 2',
            username: 'testuser2',
            role: 'buyer',
            status: 'active'
          }])
          .select()
          .single();
        
        if (createError) throw createError;
        users.push(newUser);
        console.log('Created second user:', newUser);
      }
    }
    
    const user1 = users[0];
    const user2 = users[1];
    
    console.log('Using users:', { user1: user1.username, user2: user2.username });
    
    // Create conversation
    const conversation = await Conversation.create(user1.uuid, user2.uuid);
    console.log('Created conversation:', conversation.id);
    
    // Create some messages
    await Message.create(conversation.id, user1.uuid, 'Hello! How are you?');
    console.log('Created message 1');
    
    await Message.create(conversation.id, user2.uuid, 'Hi! I\'m doing well, thanks for asking. How about you?');
    console.log('Created message 2');
    
    await Message.create(conversation.id, user1.uuid, 'I\'m great! Are you interested in my services?');
    console.log('Created message 3');
    
    console.log('Sample data created successfully!');
    
  } catch (err) {
    console.error('Error creating sample data:', err);
  }
}

createSampleData();
