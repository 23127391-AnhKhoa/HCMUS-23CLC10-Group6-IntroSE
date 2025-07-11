// models/conversation.model.js
const supabase = require('../config/supabaseClient');

const Conversation = {
  // Tìm tất cả conversations của user
  findByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('Conversations')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Manually fetch user details for each conversation
    const conversations = data || [];
    const conversationsWithUsers = await Promise.all(
      conversations.map(async (conv) => {
        const [user1, user2] = await Promise.all([
          supabase.from('User').select('uuid, fullname, username, avt_url').eq('uuid', conv.user1_id).single(),
          supabase.from('User').select('uuid, fullname, username, avt_url').eq('uuid', conv.user2_id).single()
        ]);
        
        return {
          ...conv,
          user1: user1.data,
          user2: user2.data
        };
      })
    );
    
    return conversationsWithUsers;
  },

  // Tìm conversation giữa 2 users
  findBetweenUsers: async (user1Id, user2Id) => {
    const { data, error } = await supabase
      .from('Conversations')
      .select('*')
      .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    if (data) {
      // Manually fetch user details
      const [user1, user2] = await Promise.all([
        supabase.from('User').select('uuid, fullname, username, avt_url').eq('uuid', data.user1_id).single(),
        supabase.from('User').select('uuid, fullname, username, avt_url').eq('uuid', data.user2_id).single()
      ]);
      
      return {
        ...data,
        user1: user1.data,
        user2: user2.data
      };
    }
    
    return data;
  },

  // Tạo conversation mới
  create: async (user1Id, user2Id) => {
    const { data, error } = await supabase
      .from('Conversations')
      .insert([{ user1_id: user1Id, user2_id: user2Id }])
      .select('*')
      .single();

    if (error) throw error;
    
    // Manually fetch user details
    const [user1, user2] = await Promise.all([
      supabase.from('User').select('uuid, fullname, username, avt_url').eq('uuid', data.user1_id).single(),
      supabase.from('User').select('uuid, fullname, username, avt_url').eq('uuid', data.user2_id).single()
    ]);
    
    return {
      ...data,
      user1: user1.data,
      user2: user2.data
    };
  },

  // Tìm conversation theo ID
  findById: async (conversationId) => {
    const { data, error } = await supabase
      .from('Conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) throw error;
    
    // Manually fetch user details
    const [user1, user2] = await Promise.all([
      supabase.from('User').select('uuid, fullname, username, avt_url').eq('uuid', data.user1_id).single(),
      supabase.from('User').select('uuid, fullname, username, avt_url').eq('uuid', data.user2_id).single()
    ]);
    
    return {
      ...data,
      user1: user1.data,
      user2: user2.data
    };
  }
};

module.exports = Conversation;
