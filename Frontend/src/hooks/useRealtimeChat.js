// src/hooks/useRealtimeChat.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useRealtimeChat = (conversationId, authUser) => {
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

          setMessages(prevMessages => {
            // Remove any optimistic message from the same sender with similar content
            const filteredMessages = prevMessages.filter(msg => {
              if (msg.isOptimistic && 
                  msg.sender_id === messageWithSender.sender_id && 
                  msg.content === messageWithSender.content) {
                return false; // Remove optimistic message
              }
              return true; // Keep other messages
            });
            
            return [...filteredMessages, messageWithSender];
          });
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      console.log(`Unsubscribing from conversation:${conversationId}`);
      subscription.unsubscribe();
    };
  }, [conversationId, fetchMessages]);

  // Send message function with optimistic update
  const sendMessage = async (content) => {
    if (!content.trim() || !conversationId || !authUser) return false;

    // Create optimistic message
    const optimisticMessage = {
      id: `temp-${Date.now()}`, // Temporary ID
      conversation_id: conversationId,
      sender_id: authUser.uuid,
      content: content.trim(),
      created_at: new Date().toISOString(),
      sender: {
        uuid: authUser.uuid,
        fullname: authUser.fullname,
        username: authUser.username,
        avt_url: authUser.avt_url
      },
      isOptimistic: true // Flag to identify optimistic messages
    };

    // Add optimistic message immediately
    setMessages(prevMessages => [...prevMessages, optimisticMessage]);

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
        // Remove optimistic message when real message arrives via realtime
        // The realtime subscription will handle adding the real message
        return true;
      } else {
        // Remove optimistic message on failure
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg.id !== optimisticMessage.id)
        );
        console.error('Error sending message:', response.status);
        return false;
      }
    } catch (error) {
      // Remove optimistic message on error
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== optimisticMessage.id)
      );
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
