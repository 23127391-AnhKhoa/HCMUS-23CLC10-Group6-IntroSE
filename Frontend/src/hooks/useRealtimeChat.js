// src/hooks/useRealtimeChat.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useRealtimeChat = (conversationId, authUser, refreshKey = 0) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch initial messages using backend API
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data || []);
      } else {
        console.error('Error fetching messages:', response.status);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Set up realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    // Fetch initial messages
    fetchMessages();

    // Clean up any existing subscription with the same name
    supabase.removeChannel(`conversation:${conversationId}`);

    // Subscribe to new messages
    const subscription = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          console.log('New message received:', payload);
          
          // Fetch sender details for the new message
          const { data: sender } = await supabase
            .from('User')
            .select('uuid, fullname, username, avt_url')
            .eq('uuid', payload.new.sender_id)
            .single();

          const messageWithSender = {
            ...payload.new,
            sender: sender
          };

          setMessages(prevMessages => [...prevMessages, messageWithSender]);
        }
      )
      .subscribe((status) => {
        console.log(`Conversation ${conversationId} subscription status:`, status);
      });

    // Cleanup subscription on unmount
    return () => {
      console.log(`Unsubscribing from conversation:${conversationId}`);
      subscription.unsubscribe();
    };
  }, [conversationId, fetchMessages, refreshKey]); // Add refreshKey as dependency

  // Send message function using backend API
  const sendMessage = async (content) => {
    if (!content.trim() || !conversationId || !authUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: content.trim()
        })
      });

      if (response.ok) {
        // The realtime subscription will handle updating the UI
        return true;
      } else {
        console.error('Error sending message:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    refetchMessages: fetchMessages
  };
};
