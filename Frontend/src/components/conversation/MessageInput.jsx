// src/components/conversation/MessageInput.jsx
import React from 'react';
import { 
  PaperClipIcon, 
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

const MessageInput = ({ 
  messageInput, 
  setMessageInput, 
  onSendMessage, 
  messagesLoading, 
  onScrollToBottom, 
  messagesEndRef 
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-end space-x-3">
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
          <PaperClipIcon className="h-6 w-6" />
        </button>
        
        <button 
          onClick={onScrollToBottom}
          className={`fixed bottom-20 right-1/3 transform -translate-x-1/2 
            p-3 bg-white text-gray-700 hover:bg-gray-100 
            rounded-full shadow-lg border transition-opacity duration-300 z-10 ${
            messagesEndRef.current && 
            messagesEndRef.current.getBoundingClientRect().top > window.innerHeight - 200 
            ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
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
          onClick={onSendMessage}
          disabled={!messageInput.trim() || messagesLoading}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
