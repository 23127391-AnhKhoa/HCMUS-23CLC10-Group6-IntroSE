// models/message.model.js
const supabase = require('../config/supabaseClient');

const Message = {
  // Lấy tất cả messages trong conversation
  findByConversationId: async (conversationId) => {
    const { data, error } = await supabase
      .from('Messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // Manually fetch sender details for each message
    const messages = data || [];
    const messagesWithSender = await Promise.all(
      messages.map(async (msg) => {
        const { data: sender } = await supabase
          .from('User')
          .select('uuid, fullname, username, avt_url')
          .eq('uuid', msg.sender_id)
          .single();
        
        return {
          ...msg,
          sender: sender
        };
      })
    );
    
    return messagesWithSender;
  },

  // Tạo message mới
  create: async (conversationId, senderId, content) => {
    const { data, error } = await supabase
      .from('Messages')
      .insert([{
        conversation_id: conversationId,
        sender_id: senderId,
        content: content
      }])
      .select('*')
      .single();

    if (error) throw error;
    
    // Manually fetch sender details
    const { data: sender } = await supabase
      .from('User')
      .select('uuid, fullname, username, avt_url')
      .eq('uuid', data.sender_id)
      .single();
    
    return {
      ...data,
      sender: sender
    };
  },

  // Lấy message cuối cùng của conversation
  getLastMessage: async (conversationId) => {
    const { data, error } = await supabase
      .from('Messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};

module.exports = Message;
