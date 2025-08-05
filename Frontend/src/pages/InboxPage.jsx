// src/pages/InboxPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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

  // Handle sending messages (supports both text and file URLs)
  const handleSendMessage = async (content = null) => {
    const messageContent = content || messageInput;
    
    if (!messageContent || (!messageContent.trim && !messageContent) || !selectedConversation) return;

    const success = await sendRealtimeMessage(messageContent);
    if (success) {
      // Only clear input if it was a text message
      if (!content) {
        setMessageInput('');
      }
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

  // Handle back navigation
  const handleBack = () => {
    navigate(-1); // Go back to previous page
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
        onBack={handleBack}
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
