// src/utils/timeUtils.js

/**
 * Format timestamp for display in chat messages and conversation lists
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} - Formatted time string
 */
export const formatTime = (timestamp) => {
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

/**
 * Format timestamp for message display (more detailed)
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} - Formatted time string
 */
export const formatMessageTime = (timestamp) => {
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
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  }
};
