// src/components/conversation/ChatArea.jsx
import React, { useEffect, useRef } from 'react';
import { 
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { formatMessageTime } from '../../utils/timeUtils';
import MessageInput from './MessageInput';

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const container = messagesEndRef.current?.parentNode;

    if (!container) return;

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (isNearBottom) {
      scrollToBottom();
    }
  }, [messages]);

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
                  {formatMessageTime(message.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        onSendMessage={onSendMessage}
        messagesLoading={messagesLoading}
        onScrollToBottom={scrollToBottom}
        messagesEndRef={messagesEndRef}
      />
    </div>
  );
};

export default ChatArea;
