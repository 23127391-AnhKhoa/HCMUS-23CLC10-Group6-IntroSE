# 📋 Order Management System Documentation

## 📖 Table of Contents
1. [Overview](#overview)
2. [Order Lifecycle](#order-lifecycle)
3. [User Roles](#user-roles)
4. [Core Features](#core-features)
5. [API Endpoints](#api-endpoints)
6. [Database Schema](#database-schema)
7. [File Management](#file-management)
8. [Payment System](#payment-system)
9. [Security Features](#security-features)
10. [UI Components](#ui-components)
11. [Configuration](#configuration)
12. [Troubleshooting](#troubleshooting)

---

## 🔍 Overview

The Order Management System is a comprehensive solution for handling freelance service orders on the FreeLand platform. It manages the complete order lifecycle from creation to completion, including file delivery, payment processing, and communication between buyers and sellers.

### Key Statistics
- **Order Statuses**: 6 different states
- **File Types Supported**: 55+ file formats
- **Security Measures**: Role-based access control
- **Payment Integration**: Automated escrow system

### Architecture
```
Frontend (React) ↔ Backend (Node.js/Express) ↔ Database (Supabase)
                          ↓
                    File Storage (Supabase Storage)
```

---

## 🔄 Order Lifecycle

### Order Status Flow
```
pending → in_progress → delivered → completed
    ↓         ↓           ↓
cancelled  cancelled  revision_requested
```

### Status Definitions

| Status | Description | Available Actions |
|--------|-------------|-------------------|
| `pending` | Order created, waiting for seller acceptance | Cancel, Message |
| `in_progress` | Seller working on the order | Upload delivery, Message, Cancel |
| `delivered` | Files delivered, waiting for buyer payment | Preview & Pay, Request Revision, Message |
| `completed` | Payment processed, order finished | Download files, Review, Message |
| `cancelled` | Order cancelled by buyer/seller | Message only |
| `revision_requested` | Buyer requested changes | Upload new delivery, Message |

### Transition Rules
- **pending → in_progress**: Seller accepts order
- **in_progress → delivered**: Seller marks as delivered (requires files)
- **delivered → completed**: Buyer processes payment
- **delivered → revision_requested**: Buyer requests revision
- **revision_requested → in_progress**: Automatic after revision request
- **Any status → cancelled**: Manual cancellation

---

## 👥 User Roles

### 🛒 Buyer (Client)
**Permissions:**
- ✅ View order details
- ✅ Process payment for delivered orders
- ✅ Download files after payment
- ✅ Request revisions
- ✅ Send messages
- ❌ Upload delivery files
- ❌ Mark order as delivered

**Available Actions by Status:**
- `pending`: Cancel order, Message
- `in_progress`: Message, View progress
- `delivered`: Preview & Pay, Request Revision, Message
- `completed`: Download files, Leave review, Message

### 🎨 Seller (Gig Owner)
**Permissions:**
- ✅ Upload delivery files
- ✅ Mark order as delivered
- ✅ View order details
- ✅ Send messages
- ✅ Download own uploaded files
- ❌ Process payment
- ❌ Download files before payment (unless own files)

**Available Actions by Status:**
- `pending`: Accept/Decline order, Message
- `in_progress`: Upload delivery, Message
- `delivered`: Upload additional files, Message
- `completed`: Message, View final result

---

## 🚀 Core Features

### 1. 📁 File Delivery System
- **Multi-file upload** support (up to 10 files)
- **Progress tracking** for uploads
- **File validation** and security checks
- **Preview functionality** before payment
- **Secure download** with signed URLs
- **File size limits**: 50MB per file, 500MB total

### 2. 💳 Payment Protection
- **Escrow system** - Files locked until payment
- **Balance verification** before payment
- **Automatic fund transfer** after payment
- **Transaction history** tracking
- **Refund support** for cancelled orders

### 3. 💬 Communication
- **Order-based messaging** system
- **Real-time conversations** between buyer and seller
- **Message history** preservation
- **Notification system** for updates
- **File attachment** support in messages

### 4. 📊 Order Tracking
- **Timeline visualization** with progress bars
- **Status updates** with timestamps
- **Deadline tracking** with overdue alerts
- **Edit counting** for revisions
- **Delivery confirmation** system

### 5. 🔄 Revision Management
- **Revision requests** with feedback
- **Multiple revision rounds** support
- **Status rollback** to in_progress
- **Revision history** tracking
- **Revision limit** enforcement

---

## 🛠 API Endpoints

### Order Management
```http
GET    /api/orders                     # Get user's orders
GET    /api/orders/:id                 # Get specific order
POST   /api/orders                     # Create new order
PATCH  /api/orders/:id/status          # Update order status
POST   /api/orders/:id/mark-delivered  # Mark order as delivered
DELETE /api/orders/:id                 # Cancel order
GET    /api/orders/:id/workflow        # Get order workflow status
```

### File Management
```http
POST   /api/orders/:id/upload-delivery       # Upload delivery files
GET    /api/orders/:id/delivery-files        # Get delivery files
GET    /api/orders/:id/delivery/:filename    # Download specific file
DELETE /api/orders/:id/delivery-files/:fileId # Delete delivery file
```

### Payment System
```http
POST   /api/orders/:id/pay              # Process payment
GET    /api/orders/:id/payment-status   # Check payment status
POST   /api/orders/:id/request-revision # Request revision
```

### Communication
```http
GET    /api/conversations/order/:orderId    # Get order conversation
POST   /api/conversations/:id/messages     # Send message
GET    /api/conversations/:id/messages     # Get messages
```

---

## 🗄️ Database Schema & Model Classes

### Model Classes Overview

| No. | Class name | Description |
|-----|------------|-------------|
| 1 | `Order` | Manages order lifecycle, CRUD operations, and relationships with User and Gigs tables |
| 2 | `User` | Handles user authentication, profile management, and user-related database operations |
| 3 | `Gig` | Manages freelance service listings, including creation, updates, and search functionality |
| 4 | `Conversation` | Handles messaging between users, conversation creation and management |
| 5 | `DeliveryFile` | Manages file uploads, storage, and delivery for completed orders |
| 6 | `Message` | Handles individual messages within conversations, including text and file attachments |
| 7 | `Transaction` | Manages payment processing, fund transfers, and transaction history |
| 8 | `Dashboard` | Provides analytics and reporting data for users and administrators |
| 9 | `GigMedia` | Manages media files (images, videos) associated with gig listings |

### Model Implementation Details

#### 1. Order Model (`order.model.js`)
**Purpose**: Core order management functionality
**Key Methods**:
- `findById(id)` - Retrieves order with related user and gig data
- `findByUserId(userId)` - Gets all orders for a specific user
- `create(orderData)` - Creates new order with validation
- `updateStatus(id, status)` - Updates order status with business logic
- `markAsDelivered(id)` - Marks order as delivered with timestamp
- `getWorkflow(id)` - Returns order workflow status and timeline

**Database Relationships**:
```javascript
// Order relationships
Orders → User (client_id) // Buyer relationship
Orders → Gigs → User (owner_id) // Seller relationship through gig
Orders → DeliveryFiles (order_id) // Delivery files
Orders → Conversations (order_id) // Order conversations
```

#### 2. User Model (`user.model.js`)
**Purpose**: User authentication and profile management
**Key Methods**:
- `findById(uuid)` - Find user by UUID
- `findByUsername(username)` - Find user by username
- `createProfile(profileData)` - Create new user profile
- `updateByUuid(uuid, updateData)` - Update user information
- `findAll(searchTerm)` - Search users with optional filtering
- `updateBalance(uuid, amount)` - Update user balance for payments

**User Properties**:
- `uuid` (Primary Key)
- `username` (Unique)
- `fullname`
- `email`
- `avt_url` (Avatar URL)
- `balance` (Account balance)
- `role` (buyer/seller/admin)

#### 3. Gig Model (`gig.model.js`)
**Purpose**: Freelance service listing management
**Key Methods**:
- `findById(id)` - Get gig with owner details
- `findByOwnerId(ownerId)` - Get all gigs by owner
- `create(gigData)` - Create new gig listing
- `update(id, gigData)` - Update gig information
- `search(filters)` - Search gigs with filters
- `findFeatured()` - Get featured gigs
- `updateStatus(id, status)` - Update gig status

**Connection Management**:
```javascript
// Retry mechanism for database connections
const executeQueryWithRetry = async (queryFunction, queryName) => {
  // Handles connection failures and retries
  const result = await queryFunction(supabase);
  if (result.data.length === 0) {
    const freshClient = refreshConnection();
    return await queryFunction(freshClient);
  }
  return result;
};
```

#### 4. Conversation Model (`conversation.model.js`)
**Purpose**: Messaging system management
**Key Methods**:
- `findByUserId(userId)` - Get all conversations for user
- `findBetweenUsers(user1Id, user2Id)` - Find conversation between two users
- `create(conversationData)` - Create new conversation
- `findByOrderId(orderId)` - Get conversation for specific order
- `updateLastMessage(id, messageData)` - Update conversation timestamp

**User Details Integration**:
```javascript
// Automatically fetch user details for conversations
const conversationsWithUsers = await Promise.all(
  conversations.map(async (conv) => {
    const [user1, user2] = await Promise.all([
      supabase.from('User').select('uuid, fullname, username, avt_url')
        .eq('uuid', conv.user1_id).single(),
      supabase.from('User').select('uuid, fullname, username, avt_url')
        .eq('uuid', conv.user2_id).single()
    ]);
    return { ...conv, user1: user1.data, user2: user2.data };
  })
);
```

#### 5. DeliveryFile Model (`deliveryFile.model.js`)
**Purpose**: File upload and delivery management
**Key Methods**:
- `create(fileData)` - Create delivery file record
- `findByOrderId(orderId)` - Get all delivery files for order
- `delete(id)` - Delete delivery file record
- `updateStatus(id, status)` - Update file upload status
- `getDownloadUrl(id)` - Generate secure download URL

**File Data Structure**:
```javascript
const dbData = {
  order_id: fileData.order_id,
  original_name: fileData.original_name,
  file_name: fileData.file_name,
  file_size: fileData.file_size,
  file_type: fileData.file_type,
  storage_path: fileData.storage_path,
  uploaded_by: fileData.uploaded_by,
  upload_status: fileData.upload_status || 'uploaded'
};
```

#### 6. Message Model (`message.model.js`)
**Purpose**: Individual message handling within conversations
**Key Methods**:
- `create(messageData)` - Create new message
- `findByConversationId(conversationId)` - Get all messages in conversation
- `markAsRead(id, userId)` - Mark message as read
- `findUnreadCount(userId)` - Get unread message count
- `updateContent(id, content)` - Update message content

#### 7. Transaction Model (`transaction.model.js`)
**Purpose**: Payment and financial transaction management
**Key Methods**:
- `create(transactionData)` - Create new transaction
- `findByOrderId(orderId)` - Get transactions for order
- `findByUserId(userId)` - Get user transaction history
- `updateStatus(id, status)` - Update transaction status
- `processPayment(orderData)` - Process order payment

#### 8. Dashboard Model (`dashboard.model.js`)
**Purpose**: Analytics and reporting data
**Key Methods**:
- `getOrderStats(userId)` - Get order statistics
- `getRevenueData(userId, period)` - Get revenue analytics
- `getTopGigs(limit)` - Get top performing gigs
- `getUserActivity(userId)` - Get user activity data

#### 9. GigMedia Model (`gigMedia.model.js`)
**Purpose**: Media file management for gigs
**Key Methods**:
- `create(mediaData)` - Add media to gig
- `findByGigId(gigId)` - Get all media for gig
- `delete(id)` - Delete media file
- `updateOrder(gigId, mediaOrder)` - Update media display order

### Database Tables Schema

#### Orders Table
```sql
CREATE TABLE Orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id UUID REFERENCES Gigs(id) ON DELETE CASCADE,
    client_id UUID REFERENCES Users(uuid) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    price_at_purchase DECIMAL(10,2) NOT NULL,
    requirement TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    delivered_at TIMESTAMP,
    completed_at TIMESTAMP,
    due_date DATE,
    revision_count INTEGER DEFAULT 0,
    max_revisions INTEGER DEFAULT 3,
    
    CONSTRAINT valid_status CHECK (status IN (
        'pending', 'in_progress', 'delivered', 
        'completed', 'cancelled', 'revision_requested'
    ))
);
```

#### Users Table
```sql
CREATE TABLE Users (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avt_url VARCHAR(500),
    balance DECIMAL(10,2) DEFAULT 0.00,
    role VARCHAR(20) DEFAULT 'buyer',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_role CHECK (role IN ('buyer', 'seller', 'admin'))
);
```

#### Gigs Table
```sql
CREATE TABLE Gigs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    delivery_days INTEGER NOT NULL,
    num_of_edits INTEGER DEFAULT 1,
    cover_image VARCHAR(500),
    owner_id UUID REFERENCES Users(uuid) ON DELETE CASCADE,
    category_id UUID REFERENCES Categories(id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'deleted'))
);
```

#### DeliveryFiles Table
```sql
CREATE TABLE DeliveryFiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES Orders(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    uploaded_by UUID REFERENCES Users(uuid),
    upload_status VARCHAR(20) DEFAULT 'uploaded'
);
```

#### Conversations Table
```sql
CREATE TABLE Conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES Users(uuid) ON DELETE CASCADE,
    user2_id UUID REFERENCES Users(uuid) ON DELETE CASCADE,
    order_id UUID REFERENCES Orders(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_message_at TIMESTAMP
);
```

#### Messages Table
```sql
CREATE TABLE Messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES Conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES Users(uuid) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    created_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP,
    
    CONSTRAINT valid_message_type CHECK (message_type IN (
        'text', 'file', 'system', 'payment', 'revision'
    ))
);
```

#### Transactions Table
```sql
CREATE TABLE Transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES Orders(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES Users(uuid) ON DELETE CASCADE,
    seller_id UUID REFERENCES Users(uuid) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    
    CONSTRAINT valid_transaction_type CHECK (transaction_type IN (
        'payment', 'refund', 'commission'
    )),
    CONSTRAINT valid_status CHECK (status IN (
        'pending', 'processing', 'completed', 'failed', 'cancelled'
    ))
);
```

---

## 📁 File Management

### Supported File Types (55+ formats)

#### 🖼️ Images
- **Formats**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.svg`, `.webp`, `.tiff`, `.ico`
- **MIME Types**: `image/jpeg`, `image/png`, `image/gif`, `image/svg+xml`, etc.
- **Use Cases**: Logos, designs, mockups, screenshots

#### 🎥 Videos
- **Formats**: `.mp4`, `.avi`, `.mov`, `.wmv`, `.mkv`, `.webm`, `.flv`, `.3gp`
- **MIME Types**: `video/mp4`, `video/avi`, `video/mov`, `video/quicktime`, etc.
- **Use Cases**: Video deliverables, demos, tutorials

#### 📄 Documents
- **Formats**: `.pdf`, `.doc`, `.docx`, `.txt`, `.rtf`, `.csv`, `.xls`, `.xlsx`, `.ppt`, `.pptx`
- **MIME Types**: `application/pdf`, `application/msword`, `text/plain`, etc.
- **Use Cases**: Reports, presentations, documentation

#### 🎵 Audio
- **Formats**: `.mp3`, `.wav`, `.flac`, `.aac`, `.ogg`, `.wma`, `.m4a`
- **MIME Types**: `audio/mpeg`, `audio/wav`, `audio/flac`, `audio/aac`, etc.
- **Use Cases**: Voice-overs, music, sound effects

#### 📦 Archives
- **Formats**: `.zip`, `.rar`, `.7z`, `.tar`, `.gz`
- **MIME Types**: `application/zip`, `application/x-rar-compressed`, etc.
- **Use Cases**: Multiple file delivery, source code packages

#### 🎨 Design Files
- **Formats**: `.psd`, `.ai`, `.eps`, `.sketch`, `.fig`
- **MIME Types**: `application/vnd.adobe.photoshop`, `application/postscript`, etc.
- **Use Cases**: Source design files, vector graphics

#### 💻 Development Files
- **Formats**: `.json`, `.xml`, `.html`, `.css`, `.js`, `.sql`
- **MIME Types**: `application/json`, `application/xml`, `text/html`, etc.
- **Use Cases**: Code files, configuration files

### File Security
- **Blocked Extensions**: `.exe`, `.msi`, `.bat`, `.cmd`, `.com`, `.scr`, `.vbs`, `.jar`
- **Size Limits**: 50MB per file, 500MB total per order
- **Virus Scanning**: Integrated with Supabase storage security
- **Access Control**: Role-based download permissions

### File Validation Process
```javascript
// Backend validation
const allowedTypes = [
  'image/jpeg', 'image/png', 'application/pdf',
  'application/zip', 'video/mp4', 'audio/mpeg',
  // ... 55+ supported types
];

// Security checks
if (!allowedTypes.includes(file.mimetype)) {
  throw new Error('File type not allowed');
}

if (file.size > 50 * 1024 * 1024) {
  throw new Error('File too large');
}
```

---

## 💰 Payment System

### Payment Flow
```
1. Seller uploads delivery files
2. Seller marks order as "delivered"
3. Buyer previews files (download blocked)
4. Buyer processes payment
5. Funds transferred from buyer to seller
6. Order marked as "completed"
7. Files unlocked for buyer download
```

### Payment Security
- **Balance Verification**: Check buyer has sufficient funds
- **Escrow Protection**: Files locked until payment
- **Transaction Atomicity**: Database transactions ensure consistency
- **Audit Trail**: Complete payment history tracking

### Payment States
- **Pending**: Order created, no payment required yet
- **Required**: Delivery completed, payment needed
- **Processing**: Payment being processed
- **Completed**: Payment successful, funds transferred
- **Failed**: Payment failed, retry available

### Transaction Table
```sql
CREATE TABLE Transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES Orders(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES Users(uuid) ON DELETE CASCADE,
    seller_id UUID REFERENCES Users(uuid) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    
    CONSTRAINT valid_transaction_type CHECK (transaction_type IN (
        'payment', 'refund', 'commission'
    )),
    CONSTRAINT valid_status CHECK (status IN (
        'pending', 'processing', 'completed', 'failed', 'cancelled'
    ))
);
```

---

## 🔐 Security Features

### Authentication & Authorization
- **JWT Token** based authentication
- **Role-based access control** (RBAC)
- **Order ownership** verification
- **API endpoint protection**

### File Security
- **Upload validation** with whitelist approach
- **Malware scanning** through Supabase
- **Signed URLs** for secure download
- **Access control** based on payment status

### Data Protection
- **SQL injection** prevention with parameterized queries
- **XSS protection** with input sanitization
- **CSRF tokens** for form submissions
- **Rate limiting** on API endpoints

### Privacy
- **Order isolation** - Users only see their orders
- **File access control** - Download permissions enforced
- **Message privacy** - Conversations limited to order participants
- **PII protection** - Sensitive data encryption

### Authorization Matrix
| Action | Buyer | Seller | Admin |
|--------|-------|--------|-------|
| View Order | Own orders | Own orders | All orders |
| Upload Delivery | ❌ | ✅ | ✅ |
| Download Files | After payment | Always | Always |
| Process Payment | ✅ | ❌ | ✅ |
| Cancel Order | ✅ | ✅ | ✅ |
| Message | ✅ | ✅ | ✅ |

---

## 🎨 UI Components

### OrderCard Component
**Location**: `Frontend/src/components/OrderCard/OrderCard.jsx`

**Features:**
- Order status visualization with timeline
- File upload and management
- Payment processing interface
- Messaging integration
- Action buttons based on user role and order status

**Props:**
```javascript
{
  order: Object,           // Order data
  userRole: String,        // 'buyer' or 'seller'
  onStatusUpdate: Function, // Callback for status changes
  onFileUpload: Function,  // Callback for file uploads
  onPayment: Function      // Callback for payment processing
}
```

### DeliveryFilesModal Component
**Location**: `Frontend/src/components/DeliveryFilesModal/DeliveryFilesModal.jsx`

**Features:**
- File preview and download
- Payment interface
- Revision request functionality
- File management (delete for sellers)

**State Management:**
```javascript
const [files, setFiles] = useState([]);
const [loading, setLoading] = useState(false);
const [canDownload, setCanDownload] = useState(false);
const [paymentRequired, setPaymentRequired] = useState(false);
```

### UploadDeliveryModal Component
**Location**: `Frontend/src/components/UploadDeliveryModal/UploadDeliveryModal.jsx`

**Features:**
- Multi-file upload with drag & drop
- Progress tracking
- File validation
- Message attachment

### Timeline Component
**Features:**
- Visual progress tracking
- Status-based styling
- Due date alerts
- Milestone indicators

### Message Component
**Features:**
- Real-time messaging
- File attachment support
- Message history
- Typing indicators

---

## 🔧 Configuration

### Environment Variables
```bash
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Server
PORT=8000
NODE_ENV=production

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# File Upload
MAX_FILE_SIZE=50MB
MAX_FILES_PER_ORDER=10
ALLOWED_FILE_TYPES=image/*,video/*,application/pdf

# Payment
PAYMENT_PROCESSOR=internal
COMMISSION_RATE=0.05
```

### Frontend Configuration
```javascript
// Frontend/src/config/api.js
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    ORDERS: '/api/orders',
    UPLOAD_DELIVERY: (orderId) => `/api/orders/${orderId}/upload-delivery`,
    PAYMENT: (orderId) => `/api/orders/${orderId}/pay`,
    CONVERSATIONS: '/api/conversations'
  }
};
```

### Database Configuration
```javascript
// Backend/config/supabaseClient.js
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    },
    db: {
      schema: 'public'
    }
  }
);
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. File Upload Errors
**Problem**: "Only the seller can upload delivery files"
**Solution**: 
- Verify user is logged in as the seller of the order
- Check order status is `in_progress` or `revision_requested`
- Ensure JWT token is valid and contains correct user ID

#### 2. Payment Failures
**Problem**: "Payment failed: Only the buyer can process payment"
**Solution**:
- Verify user is logged in as the buyer of the order
- Check order status is `delivered`
- Ensure buyer has sufficient balance

#### 3. File Download Issues
**Problem**: "Files can only be downloaded after payment completion"
**Solution**:
- Verify payment has been processed
- Check order status is `completed`
- Ensure user has proper permissions

#### 4. Upload File Type Errors
**Problem**: "File type not allowed"
**Solution**:
- Check file extension is in allowed list
- Verify MIME type is supported
- Ensure file is not corrupted

### Debug Tools

#### Backend Logging
```javascript
// Enable debug logging
console.log('🔍 Order details:', order);
console.log('👤 User authorization:', { userId, role });
console.log('📁 File validation:', { filename, mimetype, size });
```

#### Frontend Error Handling
```javascript
// API error handling
try {
  const response = await ApiService.uploadDeliveryFiles(orderId, files);
} catch (error) {
  if (error.response?.data?.details) {
    console.error('Detailed error:', error.response.data.details);
  }
  showErrorMessage(error.message);
}
```

### Performance Optimization

#### File Upload Optimization
- **Chunked uploads** for large files
- **Parallel uploads** for multiple files
- **Progress tracking** with real-time updates
- **Retry mechanism** for failed uploads

#### Database Optimization
- **Indexes** on frequently queried columns
- **Pagination** for large result sets
- **Connection pooling** for better performance
- **Query optimization** with explain plans

---

## 📊 Monitoring & Analytics

### Key Metrics
- **Order completion rate**
- **Average time to delivery**
- **Payment success rate**
- **File upload success rate**
- **User satisfaction scores**

### Health Checks
```javascript
// Backend health check endpoint
GET /api/health
Response: {
  status: 'healthy',
  database: 'connected',
  storage: 'accessible',
  uptime: '2h 30m'
}
```

### Error Tracking
- **Sentry integration** for error monitoring
- **Custom error boundaries** in React
- **API error logging** with context
- **Performance monitoring** with metrics

---

## 🚀 Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] CDN configured for file delivery
- [ ] Monitoring systems active
- [ ] Backup procedures tested
- [ ] Security audit completed

### Scaling Considerations
- **Database sharding** for large datasets
- **File storage CDN** for global delivery
- **Load balancing** for high availability
- **Caching strategies** for frequently accessed data
- **Background job processing** for long-running tasks

---

## 📈 Future Enhancements

### Planned Features
- **Multi-currency support** for international orders
- **Advanced file preview** with thumbnails
- **Batch operations** for bulk order management
- **Advanced analytics** dashboard
- **Mobile app** for order management
- **API rate limiting** with tiered access
- **Webhook notifications** for third-party integrations

### Technical Improvements
- **GraphQL API** for flexible data fetching
- **Real-time notifications** with WebSocket
- **Advanced caching** with Redis
- **Microservices architecture** for scalability
- **Event sourcing** for audit trails

---

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Complete order lifecycle management
- ✅ File upload and delivery system
- ✅ Payment processing with escrow
- ✅ Real-time messaging
- ✅ Role-based access control
- ✅ 55+ file type support
- ✅ Security and validation

### Version 0.9.0
- ✅ Basic order management
- ✅ File upload functionality
- ✅ User authentication
- ✅ Database schema design

---

## 🤝 Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations
5. Start development server: `npm run dev`

### Code Standards
- **ESLint** for code quality
- **Prettier** for code formatting
- **JSDoc** for documentation
- **Unit tests** for new features
- **Integration tests** for API endpoints

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Update documentation
5. Submit pull request

---

## 📞 Support

### Contact Information
- **Email**: support@freeland.com
- **Documentation**: https://docs.freeland.com
- **Issues**: https://github.com/freeland/issues
- **Community**: https://discord.gg/freeland

### Support Channels
- **Bug Reports**: GitHub Issues
- **Feature Requests**: GitHub Discussions
- **General Help**: Discord Community
- **Business Inquiries**: Email Support

---

*Last updated: July 16, 2025*
*Version: 1.0.0*
*Authors: FreeLand Development Team*
