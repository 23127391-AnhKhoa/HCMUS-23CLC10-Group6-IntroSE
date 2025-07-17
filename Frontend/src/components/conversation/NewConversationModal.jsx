// src/components/conversation/NewConversationModal.jsx
import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Avatar, Modal, Input } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const NewConversationModal = ({ 
  isOpen, 
  onClose, 
  onCreateConversation, 
  token 
}) => {
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

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

  // Handle user search in modal
  const handleUserSearch = (value) => {
    setUserSearchTerm(value);
    searchUsers(value);
  };

  const handleCreateConversation = async (userId) => {
    await onCreateConversation(userId);
    handleClose();
  };

  const handleClose = () => {
    setUserSearchTerm('');
    setAvailableUsers([]);
    onClose();
  };

  return (
    <Modal
      title="Start New Conversation"
      open={isOpen}
      onCancel={handleClose}
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
                  onClick={() => handleCreateConversation(user.uuid)}
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
  );
};

export default NewConversationModal;
