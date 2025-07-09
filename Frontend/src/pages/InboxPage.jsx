// src/pages/InboxPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeChat } from '../hooks/useRealtimeChat';
import { useRealtimeConversations } from '../hooks/useRealtimeConversations';
import { supabase } from '../lib/supabase';
import { 
  PaperClipIcon, 
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PhoneIcon,
  VideoCameraIcon,
  PlusIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Avatar, Modal, Input, Button, message as antdMessage } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const InboxPage = () => {
  const { authUser, token, refreshSupabaseConnection: authRefreshConnection } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [isRefreshingConnection, setIsRefreshingConnection] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger re-renders for hooks
  const messagesEndRef = useRef(null);

  // Use realtime hooks with refresh key
  const { conversations, loading: conversationsLoading, createConversation } = useRealtimeConversations(authUser, refreshKey);
  const { messages, loading: messagesLoading, sendMessage: sendRealtimeMessage } = useRealtimeChat(selectedConversation?.id, authUser, refreshKey);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-select first conversation when conversations load
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const success = await sendRealtimeMessage(messageInput);
    if (success) {
      setMessageInput('');
    } else {
      antdMessage.error('Failed to send message');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Search for users to start new conversation
  const searchUsers = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setAvailableUsers([]);
      return;
    }

    setSearchingUsers(true);
    try {
      const response = await fetch(`http://localhost:8000/api/users/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data || []);
      } else {
        console.error('Error searching users:', response.status);
        setAvailableUsers([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setAvailableUsers([]);
    } finally {
      setSearchingUsers(false);
    }
  };

  // Create new conversation with selected user
  const createNewConversation = async (otherUserId) => {
    try {
      const newConversation = await createConversation(otherUserId);
      
      if (newConversation) {
        // Select the new conversation
        setSelectedConversation(newConversation);
        
        // Close modal and reset
        setShowNewConversationModal(false);
        setUserSearchTerm('');
        setAvailableUsers([]);
        
        antdMessage.success('Conversation created successfully!');
      } else {
        antdMessage.error('Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      antdMessage.error('Failed to create conversation');
    }
  };

  // Handle user search in modal
  const handleUserSearch = (value) => {
    setUserSearchTerm(value);
    searchUsers(value);
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.user1_id === authUser?.uuid ? conv.user2 : conv.user1;
    return otherUser?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           otherUser?.username?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / 36e5;

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Refresh Supabase Realtime Connection
  const refreshSupabaseConnection = useCallback(async () => {
    if (!authUser || isRefreshingConnection) return;
    
    setIsRefreshingConnection(true);
    antdMessage.loading({ content: 'Refreshing connection...', key: 'refreshConnection' });
    
    try {
      console.log('🔄 Starting connection refresh for user:', authUser.uuid);
      
      // First, directly import supabase and setupConnectionMonitoring to ensure fresh state
      const { supabase, setupConnectionMonitoring } = await import('../lib/supabase');
      
      // Make sure connection monitoring is active
      setupConnectionMonitoring();
      
      // Remove any existing channels
      supabase.removeAllChannels();
      
      // Use the auth context method to refresh the connection with Supabase
      const success = await authRefreshConnection();
      
      if (success) {
        console.log('✅ Connection refreshed successfully');
        
        // Force hooks to re-initialize by incrementing the refresh key
        setRefreshKey(prev => prev + 1);
        
        // Create a test subscription to verify connection
        const testChannel = supabase.channel('connection-test');
        testChannel.subscribe((status) => {
          console.log(`Test channel status: ${status}`);
          if (status === 'SUBSCRIBED') {
            console.log('✅ Realtime connection verified working');
            // Remove the test channel after confirmation
            setTimeout(() => supabase.removeChannel(testChannel), 1000);
          }
        });
        
        antdMessage.success({ 
          content: 'Connection refreshed successfully!', 
          key: 'refreshConnection',
          duration: 2 
        });
      } else {
        console.error('❌ Failed to refresh connection');
        antdMessage.error({ 
          content: 'Failed to refresh connection', 
          key: 'refreshConnection',
          duration: 2 
        });
      }
    } catch (error) {
      console.error('❌ Error refreshing connection:', error);
      antdMessage.error({ 
        content: 'Failed to refresh connection: ' + error.message, 
        key: 'refreshConnection',
        duration: 2
      });
    } finally {
      setIsRefreshingConnection(false);
    }
  }, [authUser, isRefreshingConnection, authRefreshConnection]);

  // Auto-refresh connection when component mounts or user changes
  useEffect(() => {
    if (authUser) {
      console.log('🔄 User detected, setting up Supabase connection for:', authUser.uuid);
      
      // Add a slight delay to ensure previous cleanup is complete
      const refreshTimer = setTimeout(() => {
        console.log('⏰ Delayed refresh triggered for:', authUser.uuid);
        refreshSupabaseConnection();
      }, 800);
      
      // Also refresh when the component is first mounted
      if (!sessionStorage.getItem('initialRefreshDone')) {
        console.log('🆕 Initial component mount, performing initial refresh');
        refreshSupabaseConnection();
        sessionStorage.setItem('initialRefreshDone', 'true');
      }
      
      return () => {
        clearTimeout(refreshTimer);
        console.log('🧹 Cleanup: refresh timer cleared');
      };
    }
  }, [authUser?.uuid, refreshSupabaseConnection]); // Only refresh when user ID changes
  
  // Test connection status
  const checkConnectionStatus = useCallback(async () => {
    try {
      antdMessage.loading({ content: 'Checking connection...', key: 'connectionCheck' });
      
      const { checkRealtimeConnection } = await import('../lib/supabase');
      const isConnected = await checkRealtimeConnection();
      
      if (isConnected) {
        antdMessage.success({ 
          content: 'Realtime connection is active!', 
          key: 'connectionCheck', 
          duration: 2 
        });
      } else {
        antdMessage.error({ 
          content: 'Realtime connection is not working', 
          key: 'connectionCheck', 
          duration: 3
        });
        
        // Auto-refresh if not connected
        setTimeout(() => refreshSupabaseConnection(), 1000);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      antdMessage.error({ 
        content: 'Error checking connection', 
        key: 'connectionCheck', 
        duration: 2
      });
    }
  }, [refreshSupabaseConnection]);

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Left Sidebar - Conversations List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={checkConnectionStatus}
                className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                title="Check connection status"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4z" />
                </svg>
              </button>
              <button
                onClick={() => setShowNewConversationModal(true)}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                title="Start new conversation"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations found
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherUser = conversation.user1_id === authUser?.uuid ? conversation.user2 : conversation.user1;
              const isSelected = selectedConversation?.id === conversation.id;
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar
                      src={otherUser?.avt_url}
                      icon={!otherUser?.avt_url && <UserOutlined />}
                      size={48}
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {otherUser?.fullname || otherUser?.username || 'Unknown User'}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {conversation.lastMessageTime && formatTime(conversation.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar
                  src={selectedConversation.user1_id === authUser?.uuid ? selectedConversation.user2?.avt_url : selectedConversation.user1?.avt_url}
                  icon={<UserOutlined />}
                  size={40}
                />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedConversation.user1_id === authUser?.uuid 
                      ? (selectedConversation.user2?.fullname || selectedConversation.user2?.username)
                      : (selectedConversation.user1?.fullname || selectedConversation.user1?.username)
                    }
                  </h2>
                  <p className="text-sm text-gray-500">
                    @{selectedConversation.user1_id === authUser?.uuid 
                      ? selectedConversation.user2?.username
                      : selectedConversation.user1?.username
                    }
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.sender_id === authUser?.uuid;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end space-x-3">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                  <PaperClipIcon className="h-6 w-6" />
                </button>
                
                <div className="flex-1">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    rows="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    style={{ minHeight: '40px', maxHeight: '120px' }}
                  />
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || messagesLoading}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          // No Conversation Selected
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No conversation selected</h3>
              <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      <Modal
        title="Start New Conversation"
        open={showNewConversationModal}
        onCancel={() => {
          setShowNewConversationModal(false);
          setUserSearchTerm('');
          setAvailableUsers([]);
        }}
        footer={null}
        width={500}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search for users
            </label>
            <Input
              placeholder="Enter username or full name..."
              value={userSearchTerm}
              onChange={(e) => handleUserSearch(e.target.value)}
              prefix={<MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />}
            />
          </div>

          {/* Users List */}
          <div className="max-h-60 overflow-y-auto">
            {availableUsers.length > 0 ? (
              <div className="space-y-2">
                {availableUsers.map((user) => (
                  <div
                    key={user.uuid}
                    onClick={() => createNewConversation(user.uuid)}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <Avatar
                      src={user.avt_url}
                      icon={!user.avt_url && <UserOutlined />}
                      size={40}
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {user.fullname || user.username}
                      </h4>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                      {user.role === 'seller' && (
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-1">
                          Seller
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : userSearchTerm && !searchingUsers ? (
              <div className="text-center py-8 text-gray-500">
                No users found
              </div>
            ) : !userSearchTerm ? (
              <div className="text-center py-8 text-gray-500">
                Start typing to search for users
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Searching...
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InboxPage;
