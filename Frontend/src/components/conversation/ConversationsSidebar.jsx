// src/components/conversation/ConversationsSidebar.jsx
import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { formatTime } from '../../utils/timeUtils';

const ConversationsSidebar = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation, 
  onNewConversation, 
  authUser 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.user1_id === authUser?.uuid ? conv.user2 : conv.user1;
    return otherUser?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           otherUser?.username?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={onNewConversation}
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
                onClick={() => onSelectConversation(conversation)}
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
  );
};

export default ConversationsSidebar;
