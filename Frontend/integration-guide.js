// Hướng dẫn tích hợp notification vào Orders
// Thêm vào đầu file Orders.jsx

import { useOrderNotification } from '../hooks/useOrderNotification';

// Trong component Orders:
const Orders = () => {
  // ... existing code ...
  
  const { notifyOrderCreated, notifyOrderStatusChange } = useOrderNotification();
  
  // Khi tạo order mới (thêm vào function createOrder):
  const createOrder = async (orderData) => {
    try {
      // ... existing order creation logic ...
      
      // Sau khi tạo order thành công:
      const newOrder = await orderApi.createOrder(orderData);
      
      // Tạo notification cho gig owner
      await notifyOrderCreated({
        id: newOrder.id,
        gig_owner_id: newOrder.gig_owner_id,
        gig_id: newOrder.gig_id,
        gig_title: newOrder.gig_title,
        client_name: newOrder.client_name,
        price_at_purchase: newOrder.price_at_purchase
      });
      
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };
  
  // Khi thay đổi status order (thêm vào function handleStatusUpdate):
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      // ... existing status update logic ...
      
      // Sau khi update status thành công:
      const updatedOrder = await orderApi.updateOrderStatus(orderId, newStatus);
      
      // Xác định ai sẽ nhận notification
      let recipientId;
      if (userRole === 'seller') {
        // Seller thay đổi status -> notify buyer
        recipientId = updatedOrder.client_id;
      } else {
        // Buyer thay đổi status -> notify seller
        recipientId = updatedOrder.gig_owner_id;
      }
      
      // Tạo notification
      await notifyOrderStatusChange(updatedOrder, newStatus, recipientId);
      
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };
  
  // ... rest of component ...
};

/* 
BACKEND INTEGRATION:
Trong order.controller.js, thêm logic tạo notification:

const createOrder = async (req, res) => {
  try {
    // ... existing order creation logic ...
    
    // Sau khi tạo order thành công:
    const newOrder = await OrderModel.create(orderData);
    
    // Tạo notification cho gig owner
    await NotificationModel.create({
      user_id: newOrder.gig_owner_id,
      type: 'order_created',
      title: 'New Order Received!',
      message: `You have received a new order for "${newOrder.gig_title}"`,
      data: {
        orderId: newOrder.id,
        gigId: newOrder.gig_id,
        gigTitle: newOrder.gig_title,
        clientName: newOrder.client_name,
        price: newOrder.price_at_purchase
      }
    });
    
    res.json({ status: 'success', data: newOrder });
  } catch (error) {
    // ... error handling ...
  }
};
*/
