# InboxPage Component Refactoring

## Overview
The InboxPage has been refactored into smaller, more manageable components following React best practices.

## Component Structure

### 1. **InboxPage.jsx** (Main Container)
- **Location**: `src/pages/InboxPage.jsx`
- **Purpose**: Main page component that orchestrates the chat functionality
- **Responsibilities**:
  - Manages state for selected conversation and message input
  - Handles conversation creation and message sending
  - Provides props to child components
  - Uses realtime hooks for data management

### 2. **ConversationsSidebar.jsx**
- **Location**: `src/components/conversation/ConversationsSidebar.jsx`
- **Purpose**: Left sidebar showing list of conversations
- **Features**:
  - Search functionality for conversations
  - Display conversation list with user avatars
  - Show last message and timestamp
  - Handle conversation selection
  - "New conversation" button

### 3. **ChatArea.jsx**
- **Location**: `src/components/conversation/ChatArea.jsx`
- **Purpose**: Main chat area for displaying messages
- **Features**:
  - Display chat header with user info
  - Show conversation messages
  - Handle message scrolling
  - Empty state when no conversation selected
  - Integrates MessageInput component

### 4. **MessageInput.jsx**
- **Location**: `src/components/conversation/MessageInput.jsx`
- **Purpose**: Input area for typing and sending messages
- **Features**:
  - Text area with auto-resize
  - Send button with loading state
  - Keyboard shortcuts (Enter to send)
  - File attachment button (placeholder)
  - Scroll to bottom button

### 5. **NewConversationModal.jsx**
- **Location**: `src/components/conversation/NewConversationModal.jsx`
- **Purpose**: Modal for starting new conversations
- **Features**:
  - User search functionality
  - Display search results with avatars
  - Handle conversation creation
  - Modal state management

## Utility Functions

### **timeUtils.js**
- **Location**: `src/utils/timeUtils.js`
- **Functions**:
  - `formatTime()`: Format timestamps for conversation list
  - `formatMessageTime()`: Format timestamps for chat messages

## Component Index

### **index.js**
- **Location**: `src/components/conversation/index.js`
- **Purpose**: Barrel export for easy component imports

## Props Interface

### ConversationsSidebar Props
```javascript
{
  conversations: Array,
  selectedConversation: Object,
  onSelectConversation: Function,
  onNewConversation: Function,
  authUser: Object
}
```

### ChatArea Props
```javascript
{
  selectedConversation: Object,
  messages: Array,
  messageInput: String,
  setMessageInput: Function,
  onSendMessage: Function,
  authUser: Object,
  messagesLoading: Boolean
}
```

### MessageInput Props
```javascript
{
  messageInput: String,
  setMessageInput: Function,
  onSendMessage: Function,
  messagesLoading: Boolean,
  onScrollToBottom: Function,
  messagesEndRef: Ref
}
```

### NewConversationModal Props
```javascript
{
  isOpen: Boolean,
  onClose: Function,
  onCreateConversation: Function,
  token: String
}
```

## Benefits of Refactoring

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be reused in other parts of the app
3. **Maintainability**: Easier to debug and modify individual features
4. **Testability**: Each component can be tested independently
5. **Performance**: Smaller components reduce re-render scope
6. **Code Organization**: Better file structure and separation of concerns

## Usage Example

```javascript
import { ConversationsSidebar, ChatArea, NewConversationModal } from '../components/conversation';

// In your component
<ConversationsSidebar
  conversations={conversations}
  selectedConversation={selectedConversation}
  onSelectConversation={setSelectedConversation}
  onNewConversation={() => setShowModal(true)}
  authUser={authUser}
/>
```

## File Structure
```
src/
├── components/
│   └── conversation/
│       ├── index.js
│       ├── ConversationsSidebar.jsx
│       ├── ChatArea.jsx
│       ├── MessageInput.jsx
│       └── NewConversationModal.jsx
├── pages/
│   └── InboxPage.jsx
└── utils/
    └── timeUtils.js
```
