# Orders API Documentation

## Overview
The Orders API provides endpoints for managing orders in the Freeland platform. Orders represent purchase requests from clients for specific gigs.

## Base URL
```
http://localhost:8000/api/orders
```

## Order Status Values
- `pending` - Order has been created but not yet started
- `in_progress` - Order is being worked on (delivery deadline is automatically calculated)
- `completed` - Order has been completed successfully
- `cancelled` - Order has been cancelled

## Delivery Deadline Calculation
When an order status is updated to `in_progress` (seller confirms the order), the system automatically calculates the delivery deadline using:
```
Delivery Deadline = Confirmation Date + Gig Delivery Days
```
This ensures accurate delivery tracking without requiring manual deadline input.

## Endpoints

### 1. Get All Orders
**GET** `/api/orders`

Get all orders with pagination and filtering options.

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 10)
- `status` (string, optional) - Filter by status
- `client_id` (string, optional) - Filter by client UUID
- `gig_id` (string, optional) - Filter by gig UUID
- `sort_by` (string, optional) - Sort field (default: created_at)
- `sort_order` (string, optional) - Sort order: asc/desc (default: desc)

**Example Request:**
```bash
GET /api/orders?page=1&limit=10&status=pending
```

**Example Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "client_id": "uuid-123",
      "gig_id": "uuid-456",
      "price_at_purchase": 50.00,
      "requirement": "I need a logo for my startup",
      "status": "pending",
      "created_at": "2024-01-15T10:30:00Z",
      "completed_at": null,
      "client_username": "johndoe",
      "client_fullname": "John Doe",
      "client_email": "john@example.com",
      "client_avatar": "https://example.com/avatar.jpg",
      "gig_title": "Professional Logo Design",
      "gig_cover_image": "https://example.com/gig-cover.jpg",
      "gig_description": "I will create a professional logo...",
      "gig_owner_id": "uuid-789",
      "gig_owner_username": "designer123",
      "gig_owner_fullname": "Jane Designer",
      "gig_owner_avatar": "https://example.com/designer-avatar.jpg"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

### 2. Get Order by ID
**GET** `/api/orders/:id`

Get a specific order by its ID.

**Parameters:**
- `id` (number) - Order ID

**Example Request:**
```bash
GET /api/orders/1
```

**Example Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "client_id": "uuid-123",
    "gig_id": "uuid-456",
    "price_at_purchase": 50.00,
    "requirement": "I need a logo for my startup",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z",
    "completed_at": null,
    "client_username": "johndoe",
    "client_fullname": "John Doe",
    "client_email": "john@example.com",
    "client_avatar": "https://example.com/avatar.jpg",
    "gig_title": "Professional Logo Design",
    "gig_cover_image": "https://example.com/gig-cover.jpg",
    "gig_description": "I will create a professional logo...",
    "gig_owner_id": "uuid-789",
    "gig_owner_username": "designer123",
    "gig_owner_fullname": "Jane Designer",
    "gig_owner_avatar": "https://example.com/designer-avatar.jpg"
  }
}
```

### 3. Create Order
**POST** `/api/orders`

Create a new order.

**Request Body:**
```json
{
  "client_id": "uuid-123",
  "gig_id": "uuid-456",
  "price_at_purchase": 50.00,
  "requirement": "I need a logo for my startup",
  "status": "pending"
}
```

**Required Fields:**
- `client_id` (string) - Client UUID
- `gig_id` (string) - Gig UUID  
- `price_at_purchase` (number) - Price at time of purchase
- `requirement` (string) - Order requirements/description

**Optional Fields:**
- `status` (string) - Order status (default: "pending")

**Example Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "client_id": "uuid-123",
    "gig_id": "uuid-456",
    "price_at_purchase": 50.00,
    "requirement": "I need a logo for my startup",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z",
    "completed_at": null
  }
}
```

### 4. Update Order
**PUT** `/api/orders/:id`

Update an existing order.

**Parameters:**
- `id` (number) - Order ID

**Request Body:**
```json
{
  "requirement": "Updated requirement text",
  "status": "in_progress"
}
```

**Updatable Fields:**
- `price_at_purchase` (number)
- `requirement` (string)
- `status` (string)
- `completed_at` (timestamp)

**Note:** `client_id`, `gig_id`, and `created_at` cannot be updated.

**Example Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "client_id": "uuid-123",
    "gig_id": "uuid-456",
    "price_at_purchase": 50.00,
    "requirement": "Updated requirement text",
    "status": "in_progress",
    "created_at": "2024-01-15T10:30:00Z",
    "completed_at": null
  }
}
```

### 5. Delete Order
**DELETE** `/api/orders/:id`

Delete an order (only pending orders can be deleted).

**Parameters:**
- `id` (number) - Order ID

**Example Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "client_id": "uuid-123",
    "gig_id": "uuid-456",
    "price_at_purchase": 50.00,
    "requirement": "I need a logo for my startup",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z",
    "completed_at": null
  },
  "message": "Order deleted successfully"
}
```

### 6. Get Client Orders
**GET** `/api/orders/client/:clientId`

Get all orders for a specific client.

**Parameters:**
- `clientId` (string) - Client UUID

**Query Parameters:**
- `limit` (number, optional) - Limit results
- `offset` (number, optional) - Offset for pagination
- `status` (string, optional) - Filter by status

**Example Request:**
```bash
GET /api/orders/client/uuid-123?status=pending&limit=5
```

**Example Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "client_id": "uuid-123",
      "gig_id": "uuid-456",
      "price_at_purchase": 50.00,
      "requirement": "I need a logo for my startup",
      "status": "pending",
      "created_at": "2024-01-15T10:30:00Z",
      "completed_at": null,
      "gig_title": "Professional Logo Design",
      "gig_cover_image": "https://example.com/gig-cover.jpg",
      "gig_description": "I will create a professional logo...",
      "gig_owner_id": "uuid-789",
      "gig_owner_username": "designer123",
      "gig_owner_fullname": "Jane Designer",
      "gig_owner_avatar": "https://example.com/designer-avatar.jpg"
    }
  ]
}
```

### 7. Get Owner Orders
**GET** `/api/orders/owner/:ownerId`

Get all orders for gigs owned by a specific user.

**Parameters:**
- `ownerId` (string) - Gig owner UUID

**Query Parameters:**
- `limit` (number, optional) - Limit results
- `offset` (number, optional) - Offset for pagination
- `status` (string, optional) - Filter by status

**Example Request:**
```bash
GET /api/orders/owner/uuid-789?status=in_progress&limit=10
```

**Example Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "client_id": "uuid-123",
      "gig_id": "uuid-456",
      "price_at_purchase": 50.00,
      "requirement": "I need a logo for my startup",
      "status": "in_progress",
      "created_at": "2024-01-15T10:30:00Z",
      "completed_at": null,
      "client_username": "johndoe",
      "client_fullname": "John Doe",
      "client_email": "john@example.com",
      "client_avatar": "https://example.com/avatar.jpg",
      "gig_title": "Professional Logo Design",
      "gig_cover_image": "https://example.com/gig-cover.jpg",
      "gig_description": "I will create a professional logo..."
    }
  ]
}
```

### 8. Update Order Status
**PATCH** `/api/orders/:id/status`

Update only the status of an order.

**Parameters:**
- `id` (number) - Order ID

**Request Body:**
```json
{
  "status": "completed"
}
```

**Valid Status Values:**
- `pending`
- `in_progress`
- `completed`
- `cancelled`

**Example Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "client_id": "uuid-123",
    "gig_id": "uuid-456",
    "price_at_purchase": 50.00,
    "requirement": "I need a logo for my startup",
    "status": "completed",
    "created_at": "2024-01-15T10:30:00Z",
    "completed_at": "2024-01-20T14:30:00Z"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Missing required fields: client_id, gig_id, price_at_purchase, and requirement are required"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Order not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Error fetching orders: Database connection failed"
}
```

## Database Schema

The Orders table has the following structure:

```sql
CREATE TABLE public."Orders" (
  id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  client_id uuid NOT NULL DEFAULT gen_random_uuid(),
  gig_id uuid NOT NULL DEFAULT gen_random_uuid(),
  price_at_purchase numeric NOT NULL,
  requirement text NOT NULL,
  status text NULL DEFAULT 'pending'::text,
  created_at timestamp with time zone NULL DEFAULT now(),
  completed_at timestamp with time zone NULL,
  CONSTRAINT Orders_pkey PRIMARY KEY (id),
  CONSTRAINT Orders_client_id_fkey FOREIGN KEY (client_id) REFERENCES "User" (uuid),
  CONSTRAINT Orders_gig_id_fkey FOREIGN KEY (gig_id) REFERENCES "Gigs" (id) ON DELETE RESTRICT
);
```

## Usage Notes

1. **Authentication**: All endpoints are currently public for development. In production, implement authentication middleware.

2. **Authorization**: Users should only be able to access their own orders (as clients or gig owners).

3. **Validation**: The API validates that:
   - Required fields are present
   - Referenced gigs and users exist
   - Only pending orders can be deleted
   - Status transitions are valid

4. **Auto-timestamps**: When an order status is updated to "completed", the `completed_at` field is automatically set.

5. **Relationships**: The API automatically includes related data from User and Gigs tables in responses.

6. **Error Handling**: All endpoints return consistent error responses with appropriate HTTP status codes.
