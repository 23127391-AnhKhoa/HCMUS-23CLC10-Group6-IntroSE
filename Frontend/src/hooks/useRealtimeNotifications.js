// hooks/useRealtimeNotifications.js
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export const useRealtimeNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  // Debug log
  console.log('🔍 useRealtimeNotifications called with userId:', userId);

  // Function to fetch notifications from API
  const fetchNotifications = async () => {
    if (!userId) {
      console.log('⚠️ No userId provided, skipping fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('📡 Fetching notifications for userId:', userId);
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      
      const response = await fetch(`http://localhost:8000/api/notifications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Fetch response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Fetch response data:', data);
        if (data.status === 'success') {
          setNotifications(data.data.notifications);
          setUnreadCount(data.data.unreadCount);
          console.log('✅ Notifications set:', data.data.notifications.length, 'items');
        }
      } else {
        console.error('❌ Failed to fetch notifications:', response.statusText);
      }
    } catch (error) {
      console.error('💥 Error fetching notifications:', error);
    } finally {
      setLoading(false);
      console.log('🏁 Fetch completed, loading set to false');
    }
  };

  // Function to mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          // Update local state
          setNotifications(prev => 
            prev.map(notif => 
              notif.id === notificationId 
                ? { ...notif, is_read: true, read_at: new Date().toISOString() }
                : notif
            )
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  // Function to mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8000/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          // Update local state
          setNotifications(prev => 
            prev.map(notif => ({ 
              ...notif, 
              is_read: true, 
              read_at: new Date().toISOString() 
            }))
          );
          setUnreadCount(0);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  };

  // Function to delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          // Update local state
          const deletedNotification = notifications.find(n => n.id === notificationId);
          setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
          
          // Update unread count if deleted notification was unread
          if (deletedNotification && !deletedNotification.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    fetchNotifications();

    // Set up realtime subscription
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('🔔 New notification received:', payload.new);
          
          // Add new notification to the beginning of the list
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Show browser notification if supported
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(payload.new.title, {
              body: payload.new.message,
              icon: '/icon.svg',
              tag: payload.new.id
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('📝 Notification updated:', payload.new);
          
          // Update notification in local state
          setNotifications(prev => 
            prev.map(notif => 
              notif.id === payload.new.id ? payload.new : notif
            )
          );

          // Update unread count if read status changed
          if (payload.old.is_read !== payload.new.is_read) {
            setUnreadCount(prev => 
              payload.new.is_read ? Math.max(0, prev - 1) : prev + 1
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('🗑️ Notification deleted:', payload.old);
          
          // Remove notification from local state
          setNotifications(prev => prev.filter(notif => notif.id !== payload.old.id));
          
          // Update unread count if deleted notification was unread
          if (!payload.old.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Cleanup subscription on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications
  };
};
