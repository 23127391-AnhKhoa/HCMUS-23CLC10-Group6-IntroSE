// pages/NotificationPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import NavBar_Buyer from '../Common/NavBar_Buyer';
import NavBar_Seller from '../Common/NavBar_Seller';
import Footer from '../Common/Footer';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  MessageOutlined,
  DollarOutlined,
  UserOutlined,
  LoadingOutlined,
  MailOutlined
} from '@ant-design/icons';

const NotificationPage = () => {
  const { authUser } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useRealtimeNotifications(authUser?.uuid);

  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'order', 'message', etc.

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_created':
      case 'order_completed':
      case 'order_cancelled':
        return <ShoppingCartOutlined className="text-blue-500" />;
      case 'message_received':
        return <MessageOutlined className="text-green-500" />;
      case 'payment_received':
      case 'payment_completed':
        return <DollarOutlined className="text-yellow-500" />;
      case 'gig_approved':
      case 'gig_rejected':
        return <EyeOutlined className="text-purple-500" />;
      default:
        return <BellOutlined className="text-gray-500" />;
    }
  };

  // Get background color based on notification type
  const getNotificationBg = (type, isRead) => {
    const baseClasses = isRead ? 'bg-gray-50' : 'bg-blue-50';
    const borderClasses = isRead ? 'border-gray-200' : 'border-blue-200';
    return `${baseClasses} ${borderClasses}`;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.is_read) return false;
    if (filter === 'read' && !notification.is_read) return false;
    if (selectedType !== 'all' && !notification.type.includes(selectedType)) return false;
    return true;
  });

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type and data
    if (notification.data?.orderId) {
      // Navigate to orders page
      window.location.href = '/orders';
    } else if (notification.data?.gigId) {
      // Navigate to gig detail
      window.location.href = `/gig/${notification.data.gigId}`;
    } else if (notification.data?.conversationId) {
      // Navigate to inbox
      window.location.href = '/inbox';
    }
  };

  // Handle delete notification
  const handleDelete = async (notificationId, event) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this notification?')) {
      await deleteNotification(notificationId);
    }
  };

  // Handle mark as read
  const handleMarkAsRead = async (notificationId, event) => {
    event.stopPropagation();
    await markAsRead(notificationId);
  };

  // Determine which navbar to show
  const navBarComponent = authUser?.role === 'seller' ? <NavBar_Seller /> : <NavBar_Buyer />;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
        {navBarComponent}
        <div className="flex-1 flex items-center justify-center py-32">
          <div className="text-center">
            <LoadingOutlined className="text-4xl text-blue-500 mb-4" />
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      {navBarComponent}
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <BellOutlined className="mr-3 text-blue-600" />
                Notifications
              </h1>
              <p className="text-gray-600">
                {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckOutlined className="mr-2" />
                Mark All Read
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Read/Unread Filter */}
            <div className="flex bg-gray-200 rounded-lg p-1">
              {['all', 'unread', 'read'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                    filter === filterType
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {filterType}
                  {filterType === 'unread' && unreadCount > 0 && (
                    <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="order">Orders</option>
              <option value="message">Messages</option>
              <option value="payment">Payments</option>
              <option value="gig">Gigs</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <MailOutlined className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500">
                {filter === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : "You don't have any notifications yet."
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`${getNotificationBg(notification.type, notification.is_read)} 
                  border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-1">
                        <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className={`text-sm ${!notification.is_read ? 'text-gray-700' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.is_read && (
                      <button
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Mark as read"
                      >
                        <CheckOutlined className="text-sm" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(notification.id, e)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete notification"
                    >
                      <DeleteOutlined className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Button (if needed for pagination) */}
        {filteredNotifications.length >= 20 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              Load More Notifications
            </button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default NotificationPage;
