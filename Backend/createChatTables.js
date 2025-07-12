const supabase = require('./config/supabaseClient');

async function createChatTables() {
  try {
    console.log('Creating chat tables...');
    
    // Create Conversations table
    const createConversationsSQL = `
      CREATE TABLE IF NOT EXISTS public."Conversations" (
        id SERIAL PRIMARY KEY,
        user1_id UUID NOT NULL,
        user2_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT fk_user1 FOREIGN KEY (user1_id) REFERENCES public."User"(uuid),
        CONSTRAINT fk_user2 FOREIGN KEY (user2_id) REFERENCES public."User"(uuid)
      );
    `;
    
    const { data: convData, error: convError } = await supabase.rpc('exec_sql', {
      sql: createConversationsSQL
    });
    
    if (convError) {
      console.log('Error creating Conversations table:', convError);
      
      // Try alternative approach - insert a dummy row to check if table exists
      const { data: testData, error: testError } = await supabase
        .from('Conversations')
        .select('*')
        .limit(1);
      
      if (testError) {
        console.log('Conversations table does not exist:', testError);
      } else {
        console.log('Conversations table exists');
      }
    } else {
      console.log('Conversations table created successfully');
    }
    
    // Create Messages table
    const createMessagesSQL = `
      CREATE TABLE IF NOT EXISTS public."Messages" (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL,
        sender_id UUID NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT fk_conversation FOREIGN KEY (conversation_id) REFERENCES public."Conversations"(id),
        CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES public."User"(uuid)
      );
    `;
    
    const { data: msgData, error: msgError } = await supabase.rpc('exec_sql', {
      sql: createMessagesSQL
    });
    
    if (msgError) {
      console.log('Error creating Messages table:', msgError);
      
      // Try alternative approach
      const { data: testData, error: testError } = await supabase
        .from('Messages')
        .select('*')
        .limit(1);
      
      if (testError) {
        console.log('Messages table does not exist:', testError);
      } else {
        console.log('Messages table exists');
      }
    } else {
      console.log('Messages table created successfully');
    }
    
    console.log('Table creation process completed');
    
  } catch (err) {
    console.error('Error:', err);
  }
}

createChatTables();
