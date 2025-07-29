// src/pages/InboxPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeChat } from '../hooks/useRealtimeChat';
import { useRealtimeConversations } from '../hooks/useRealtimeConversations';
import { message as antdMessage } from 'antd';
import { 
  ConversationsSidebar, 
  ChatArea, 
  NewConversationModal 
} from '../components/conversation';

const InboxPage = () => {
  const { authUser, token } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);

  // Use realtime hooks
  const { conversations, loading: conversationsLoading, createConversation } = useRealtimeConversations(authUser);
  const { messages, loading: messagesLoading, sendMessage: sendRealtimeMessage } = useRealtimeChat(selectedConversation?.id, authUser);

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

  // Create new conversation with selected user
  const handleCreateNewConversation = async (otherUserId) => {
    try {
      const newConversation = await createConversation(otherUserId);
      
      if (newConversation) {
        // Select the new conversation
        setSelectedConversation(newConversation);
        antdMessage.success('Conversation created successfully!');
        return true;
      } else {
        antdMessage.error('Failed to create conversation');
        return false;
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      antdMessage.error('Failed to create conversation');
      return false;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Left Sidebar - Conversations List */}
      <ConversationsSidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
        onNewConversation={() => setShowNewConversationModal(true)}
        authUser={authUser}
      />

      {/* Right Side - Chat Area */}
      <ChatArea
        selectedConversation={selectedConversation}
        messages={messages}
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        onSendMessage={handleSendMessage}
        authUser={authUser}
        messagesLoading={messagesLoading}
      />

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        onCreateConversation={handleCreateNewConversation}
        token={token}
      />
    </div>
  );
};

export default InboxPage;
