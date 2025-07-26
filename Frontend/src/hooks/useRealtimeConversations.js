// src/hooks/useRealtimeConversations.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useRealtimeConversations = (authUser) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch conversations using backend API
  const fetchConversations = useCallback(async () => {
    if (!authUser) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data || []);
      } else {
        console.error('Error fetching conversations:', response.status);
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  // Setup realtime subscription for conversations
  useEffect(() => {
    if (!authUser) return;
    
    fetchConversations();

    const conversationChannel = supabase
      .channel('conversations')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'Conversations',
          filter: `user1_id=eq.${authUser.uuid}`
        },
        fetchConversations
      )
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'Conversations', 
          filter: `user2_id=eq.${authUser.uuid}`
        },
        fetchConversations
      )
      .subscribe();

    return () => {
      console.log('Unsubscribing from conversations channel');
      conversationChannel.unsubscribe();
    };
  }, [authUser, fetchConversations]);

  // Subscribe to new messages to update last message
  useEffect(() => {
    if (!authUser) return;

    const messageChannel = supabase
      .channel('all_messages')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Messages'
        },
        (payload) => {
          // Update last message for the conversation
          setConversations(prev => 
            prev.map(conv => {
              if (conv.id === payload.new.conversation_id) {
                return {
                  ...conv,
                  lastMessage: payload.new.content,
                  lastMessageTime: payload.new.created_at
                };
              }
              return conv;
            })
          );
        }
      )
      .subscribe();

    return () => {  
      console.log('Unsubscribing from all_messages channel');
      messageChannel.unsubscribe();
    };
  }, [authUser]);

  // Create new conversation using backend API
  const createConversation = async (otherUserId) => {
    if (!authUser || !otherUserId) return null;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          otherUserId: otherUserId
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Refresh conversations to get the new one
        await fetchConversations();
        
        return data;
      } else {
        console.error('Error creating conversation:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  return {
    conversations,
    loading,
    createConversation,
    refetchConversations: fetchConversations
  };
};
