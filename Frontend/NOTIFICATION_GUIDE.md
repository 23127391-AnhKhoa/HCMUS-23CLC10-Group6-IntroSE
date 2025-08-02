# 🔔 Hệ thống Notification Realtime - Hướng dẫn sử dụng

## 📋 Tổng quan
Hệ thống notification realtime đã được tích hợp hoàn chỉnh với các tính năng:
- ✅ Realtime notification qua Supabase
- ✅ API backend để quản lý notifications
- ✅ UI component hiển thị notifications
- ✅ Tự động tạo notification khi có order mới
- ✅ Browser notifications
- ✅ Notification bell trong navbar

## 🛠️ Các file đã tạo

### Backend:
- `Backend/models/notification.model.js` - Model quản lý database
- `Backend/controllers/notification.controller.js` - API controllers
- `Backend/routes/notifications.routes.js` - API routes
- `Backend/server.js` - Đã thêm notification routes

### Frontend:
- `Frontend/src/hooks/useRealtimeNotifications.js` - Hook quản lý realtime
- `Frontend/src/hooks/useOrderNotification.js` - Hook tạo notification cho orders
- `Frontend/src/pages/NotificationPage.jsx` - Trang hiển thị notifications
- `Frontend/src/services/notification.service.js` - API service
- `Frontend/src/components/NotificationBell/NotificationBell.jsx` - Component bell icon
- `Frontend/src/App.jsx` - Đã thêm route `/notifications`

### Database:
- `sql/create_notifications_table.sql` - Script tạo bảng notifications

## 🔧 Cài đặt và Cấu hình

### 1. Tạo bảng notifications trong Supabase:
```sql
-- Chạy script này trong Supabase SQL Editor
-- File: sql/create_notifications_table.sql
```

### 2. Cấu hình Supabase trong Frontend:
Tạo file `.env` trong thư mục Frontend:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Thêm NotificationBell vào NavBar:
```jsx
// Trong NavBar_Buyer.jsx và NavBar_Seller.jsx
import NotificationBell from '../components/NotificationBell/NotificationBell';

// Thêm vào JSX:
<NotificationBell />
```

## 📖 Cách sử dụng

### 1. Hiển thị notifications trong component:
```jsx
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';

const MyComponent = () => {
  const { notifications, unreadCount, markAsRead } = useRealtimeNotifications(userId);
  
  return (
    <div>
      <p>Unread: {unreadCount}</p>
      {notifications.map(notif => (
        <div key={notif.id} onClick={() => markAsRead(notif.id)}>
          {notif.title}
        </div>
      ))}
    </div>
  );
};
```

### 2. Tạo notification khi có event:
```jsx
import { useOrderNotification } from '../hooks/useOrderNotification';

const OrderComponent = () => {
  const { notifyOrderCreated } = useOrderNotification();
  
  const handleCreateOrder = async (orderData) => {
    // Tạo order
    const newOrder = await createOrder(orderData);
    
    // Thông báo cho gig owner
    await notifyOrderCreated({
      id: newOrder.id,
      gig_owner_id: newOrder.gig_owner_id,
      gig_title: newOrder.gig_title,
      client_name: 'Client Name',
      price_at_purchase: newOrder.price
    });
  };
};
```

### 3. Truy cập trang notifications:
```
http://localhost:3000/notifications
```

## 🎯 Workflow hoàn chỉnh

### Khi user tạo order:
1. `GigDetail.jsx` → Button "Continue" → `CreateOrderModal`
2. User điền thông tin → Click "Create Order"
3. `handleOrderSubmit()` được gọi:
   - Tạo order qua API
   - Gọi `notifyOrderCreated()` để tạo notification
4. Notification được lưu vào database
5. Supabase realtime trigger gửi notification đến gig owner
6. Gig owner nhận được:
   - Realtime update trong hook
   - Browser notification (nếu cho phép)
   - Update số count trong notification bell

### Khi user xem notifications:
1. Click vào notification bell → Dropdown hiển thị
2. Click "View All" → Chuyển đến `/notifications`
3. Click vào notification → Auto mark as read + navigate đến trang liên quan

## 🔗 API Endpoints

```
GET    /api/notifications          - Lấy danh sách notifications
GET    /api/notifications/unread-count - Lấy số lượng chưa đọc
POST   /api/notifications          - Tạo notification mới
PUT    /api/notifications/read-all - Đánh dấu tất cả đã đọc
PUT    /api/notifications/:id/read - Đánh dấu 1 notification đã đọc
DELETE /api/notifications/:id      - Xóa notification
```

## 🎨 Các loại notification được hỗ trợ:

- `order_created` - Có order mới
- `order_accepted` - Order được chấp nhận
- `order_delivered` - Order đã giao
- `order_completed` - Order hoàn thành
- `order_cancelled` - Order bị hủy
- `message_received` - Có tin nhắn mới
- `payment_received` - Nhận được thanh toán

## 🐛 Troubleshooting

### Nếu không nhận được realtime notifications:
1. Kiểm tra Supabase config trong `.env`
2. Kiểm tra table `notifications` đã được tạo chưa
3. Kiểm tra browser console có lỗi không
4. Kiểm tra Network tab có các API calls không

### Nếu browser notifications không hoạt động:
1. Kiểm tra browser đã cho phép notifications chưa
2. Thử refresh trang và cho phép permissions

## 🎉 Demo
Để test hệ thống:
1. User A tạo 1 gig
2. User B order gig của User A
3. User A sẽ nhận được notification realtime
4. User A có thể xem trong notification bell hoặc trang `/notifications`
