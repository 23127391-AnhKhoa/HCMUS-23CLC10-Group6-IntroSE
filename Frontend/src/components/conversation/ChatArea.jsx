// src/components/conversation/ChatArea.jsx
import React, { useEffect, useRef, useState } from 'react';
import { 
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { formatMessageTime } from '../../utils/timeUtils';
import MessageInput from './MessageInput';
import MessageContent from './MessageContent';

const ChatArea = ({ 
  selectedConversation, 
  messages, 
  messageInput, 
  setMessageInput, 
  onSendMessage, 
  authUser, 
  messagesLoading 
}) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToBottomInstant = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  };

  // Check if user is near bottom of chat
  const checkScrollPosition = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  // Handle conversation changes - always scroll to bottom
  useEffect(() => {
    if (selectedConversation) {
      setIsInitialLoad(true);
      setShowScrollButton(false);
    }
  }, [selectedConversation?.id]);

  // Handle messages loading - scroll to bottom on initial load or when near bottom
  useEffect(() => {
    if (
      selectedConversation &&
      !messagesLoading &&
      messages.length > 0 &&
      messagesEndRef.current
    ) {
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [messages, selectedConversation?.id, messagesLoading]);


  if (!selectedConversation) {
    return (
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
    );
  }

  // Show skeleton loading while messages are being fetched
  if (messagesLoading) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Skeleton Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>

        {/* Skeleton Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Skeleton Message 4 - Own message */}
          <div className="flex justify-end">
            <div className="max-w-xs lg:max-w-md p-4 bg-gray-300 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-400 rounded w-36 mb-2"></div>
              <div className="h-4 bg-gray-400 rounded w-44 mb-2"></div>
              <div className="h-3 bg-gray-400 rounded w-16"></div>
            </div>
          </div>

          {/* Skeleton Message 5 - Other user */}
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md p-4 bg-gray-200 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-52 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
        </div>

        {/* Skeleton Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-end space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
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
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={checkScrollPosition}
      >
        {messages.map((message) => {
          const isOwnMessage = message.sender_id === authUser?.uuid;
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                isOwnMessage
                  ? `bg-blue-500 text-white ${message.isOptimistic ? 'opacity-70' : ''}`
                  : 'bg-gray-200 text-gray-900'
              }`}>
                <MessageContent content={message.content} isOwnMessage={isOwnMessage} />
                <div className="flex items-center justify-between mt-1">
                  <p className={`text-xs ${
                    isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatMessageTime(message.created_at)}
                  </p>
                  {message.isOptimistic && (
                    <div className="ml-2 flex items-center">
                      <div className="w-3 h-3 border border-blue-200 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
        
        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-8 p-3 bg-blue-500 text-white hover:bg-blue-600 
                     rounded-full shadow-lg border transition-all duration-300 z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        onSendMessage={onSendMessage}
        messagesLoading={messagesLoading}
      />
    </div>
  );
};

export default ChatArea;
