## Freeland API Documentation

---

### 1. Introduction

Welcome to the API documentation for the Freeland! This API allows developers to build applications that interact with our marketplace, enabling programmatic access to user profiles, services, orders, messages, and more.

Whether you're building a mobile app, a web client, or an integration, this documentation provides the necessary information to get started.

### 2. Getting Started

#### 2.1. Base URL

All API requests should be prefixed with the following base URL:

`To be updated`



#### 2.2. Authentication

The API uses **Bearer Token (JWT)** authentication. After a user logs in, they receive a JSON Web Token (JWT) which must be included in the `Authorization` header of all subsequent authenticated requests.

**How to authenticate:**
1.  **Register a user:** `POST /auth/register`
2.  **Log in:** `POST /auth/login`
3.  **Receive JWT:** The login response will include an `access_token`.
4.  **Include in headers:**
    ```
    Authorization: Bearer YOUR_ACCESS_TOKEN
    ```

**Example Login Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "user_123",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "buyer" // or "seller" or "admin" or "moderator"
  }
}
```

#### 2.3. Data Formats

All request bodies and responses are in **JSON** format.
Please ensure your requests include the `Content-Type: application/json` header for `POST` and `PUT` requests.

#### 2.4. Error Handling

The API uses standard HTTP status codes to indicate the success or failure of an API request.
In case of an error, the response body will contain a JSON object with details about the error.

**Common Error Structure:**
```json
{
  "status": "error",
  "code": 400,
  "message": "Invalid input provided",
  "errors": {
    "field_name": ["Error message for field_name"],
    "another_field": ["Another error message"]
  }
}
```

**Common HTTP Status Codes:**
*   **200 OK:** The request was successful.
*   **201 Created:** The resource was successfully created.
*   **204 No Content:** The request was successful, but there is no content to return (e.g., successful deletion).
*   **400 Bad Request:** The request was malformed or invalid.
*   **401 Unauthorized:** Authentication is required or has failed.
*   **403 Forbidden:** The authenticated user does not have permission to access the resource.
*   **404 Not Found:** The requested resource could not be found.
*   **422 Unprocessable Entity:** The request was well-formed but could not be processed due to semantic errors (e.g., validation errors).
*   **429 Too Many Requests:** Rate limiting applied.
*   **500 Internal Server Error:** Something went wrong on the server.

#### 2.5. Rate Limiting

To be updated

### 3. Core Concepts & Models

#### 3.1. User Role (`role`)

Users can have one of these roles:
*   `buyer`: Can browse services, place orders, message sellers, leave reviews, and register to become a seller.
*   `seller`: Can perform all actions a buyer can, as well as create services, manage orders, communicate with buyers, and receive payments.
*   `admin`: Can manage Users, services,...
*   `moderator`: Can approve services, ban users, manage services, handle user reports, ensure compliance with platform policies, and assist in maintaining a safe and trustworthy environment.
#### 3.2. Pagination, Filtering, and Sorting

For endpoints returning lists of resources (e.g., `GET /services`, `GET /orders`), the following query parameters can be used:

*   `page`: (Integer, default: 1) The page number to retrieve.
*   `limit`: (Integer, default: 10, max: 100) The number of items per page.
*   `sort_by`: (String) The field to sort by (e.g., `created_at`, `price`, `rating`).
*   `sort_order`: (String, `asc` or `desc`, default: `desc`) The sorting order.
*   `filter_by_[field]`: (String) Filter results by a specific field (e.g., `filter_by_category=design`).

**Example:**
`GET / services?page=2&limit=50&sort_by=price&sort_order=asc&filter_by_category=developer`

#### 3.3. Data Models
*   **User Object:**
    ```json
    {
      "id": "user_uuid_123",
      "username": "john_doe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "profile_picture_url": "https://cdn.example.com/profiles/john.jpg",
      "bio": "Experienced designer.",
      "role": "seller", // or "buyer", "admin", "moderator"
      "average_rating": 4.8, // for sellers
      "reviews_count": 120, // for sellers
      "created_at": "2023-01-15T10:00:00Z",
      "updated_at": "2023-11-20T14:30:00Z"
    }
    ```

*   **Service Object:**
    ```json
    {
      "id": "serv_uuid_456",
      "seller_id": "user_uuid_123",
      "title": "I will design a stunning logo for your brand",
      "description": "I offer professional logo design services...",
      "category": "Graphic Design",
      "sub_category": "Logo Design",
      "price": 50.00, // Base price
      "currency": "Token",
      "delivery_time_days": 3,
      "revisions_included": 2,
      "is_active": true,
      "cover_image_url": "https://cdn.example.com/services/logo_design_cover.jpg",
      "gallery_image_urls": ["url1", "url2"],
      "average_rating": 4.9,
      "reviews_count": 95,
      "created_at": "2023-03-01T09:00:00Z",
      "updated_at": "2023-11-18T11:00:00Z"
    }
    ```

*   **Order Object:**
    ```json
    {
      "id": "order_uuid_789",
      "serv_id": "serv_uuid_456",
      "buyer_id": "user_uuid_456",
      "seller_id": "user_uuid_123",
      "total_amount": 55.00, // Includes price + any extras
      "currency": "Token",
      "status": "pending_delivery", // e.g., "pending_payment", "active", "pending_delivery", "completed", "cancelled", "disputed"
      "delivery_due_date": "2023-11-25T17:00:00Z",
      "buyer_requirements": "Need a modern, minimalist logo for a tech startup.",
      "delivery_notes": "Here is the first draft of the logo.", // from seller
      "created_at": "2023-11-20T10:00:00Z",
      "updated_at": "2023-11-21T12:00:00Z"
    }
    ```

*   **Message Object:**
    ```json
    {
      "id": "msg_uuid_101",
      "conversation_id": "conv_uuid_202",
      "sender_id": "user_uuid_123",
      "recipient_id": "user_uuid_456",
      "content": "Hi, I'm interested in your logo design service. Can we discuss some details?",
      "sent_at": "2023-11-21T15:00:00Z",
      "is_read": false,
      "attachments": ["https://cdn.example.com/attachments/file.pdf"] // Optional
    }
    ```

*   **Review Object:**
    ```json
    {
      "id": "review_uuid_303",
      "order_id": "order_uuid_789",
      "serv_id": "serv_uuid_456",
      "reviewer_id": "user_uuid_456", // buyer
      "reviewed_user_id": "user_uuid_123", // seller
      "rating": 5, // 1-5
      "comment": "Excellent work! Delivered on time and exceeded expectations.",
      "created_at": "2023-11-22T09:00:00Z"
    }
    ```
*   **Admin Object:**
    ```json
    {
      "id": "admin_uuid_001",
      "username": "admin_user",
      "email": "admin@example.com",
      "role": "admin",
      "created_at": "2023-01-01T00:00:00Z",
      "permissions": ["manage_users", "view_revenue", "manage_services"]
    }
    ```

*   **Moderator Object:**
    ```json
    {
      "id": "moderator_uuid_002",
      "username": "moderator_user",
      "email": "moderator@example.com",
      "role": "moderator",
      "created_at": "2023-02-15T00:00:00Z",
      "permissions": ["approve_services", "ban_users"]
    }
    ```

*   **Revenue Graph Object:**
    ```json
    {
      "date": "2024-01-01",
      "revenue": 15000,
      "orders": 200
    }
    ```

*   **Service Approval Object:**
    ```json
    {
      "service_id": "serv_uuid_456",
      "status": "approved", // or "rejected", "pending"
      "moderator_id": "moderator_uuid_002",
      "approval_date": "2024-01-05T10:00:00Z",
      "rejection_reason": "Inappropriate content" // Optional
    }
    ```
*   **Report Object:**
    ```json
    {
        "id": "report_uuid_999",
        "reporter_id": "user_uuid_reporter",
        "reported_entity_type": "service", // "service", "user", "message", "order"
        "reported_entity_id": "serv_uuid_456",
        "reason_code": "spam", // e.g., "spam", "inappropriate_content", "harassment", "scam", "policy_violation"
        "details": "This service listing appears to be spam.",
        "status": "open", // "open", "under_review", "resolved_action_taken", "resolved_no_action_needed", "escalated"
        "moderator_id": "moderator_uuid_002", // Optional: ID of moderator handling it
        "moderator_notes": "Investigating the claim.", // Optional: Internal notes
        "created_at": "2024-01-20T10:00:00Z",
        "updated_at": "2024-01-20T11:00:00Z"
    }
    ```

### 4. API Endpoints

This section details all available API endpoints, their methods, required parameters, and expected responses.

#### 4.1. Authentication & Users

*   **`POST /auth/register` - Register a new user**
    *   **Description:** Creates a new user account.
    *   **Request Body:**
        ```json
        {
          "username": "new_user",
          "email": "newuser@example.com",
          "password": "securepassword123",
          "role": "buyer" // or "seller"
        }
        ```
    *   **Response (201 Created):** See `Authentication` section for token details.
    *   **Errors:** `400 Bad Request` (missing fields, weak password), `409 Conflict` (username/email already exists).

*   **`POST /auth/login` - Log in a user**
    *   **Description:** Authenticates a user and returns a JWT.
    *   **Request Body:**
        ```json
        {
          "email": "user@example.com",
          "password": "securepassword123"
        }
        ```
    *   **Response (200 OK):** See `Authentication` section for token details.
    *   **Errors:** `401 Unauthorized` (invalid credentials).

*   **`GET /users/me` - Get current authenticated user's profile**
    *   **Description:** Retrieves the profile information of the user associated with the provided JWT.
    *   **Authentication:** Required.
    *   **Response (200 OK):** `User Object`
    *   **Errors:** `401 Unauthorized`.

*   **`GET /users/{user_id}` - Get a user's public profile**
    *   **Description:** Retrieves public profile information for a specific user.
    *   **Parameters:** `user_id` (Path, UUID) - The ID of the user.
    *   **Response (200 OK):** `User Object` (may exclude sensitive fields like email if not current user).
    *   **Errors:** `404 Not Found`.

*   **`PUT /users/me` - Update current authenticated user's profile**
    *   **Description:** Updates the profile information for the authenticated user.
    *   **Authentication:** Required.
    *   **Request Body (Partial update allowed):**
        ```json
        {
          "first_name": "Jane",
          "last_name": "Doe",
          "bio": "Passionate graphic designer.",
          "profile_picture_url": "https://new.cdn.com/profile.jpg"
        }
        ```
    *   **Response (200 OK):** Updated `User Object`.
    *   **Errors:** `400 Bad Request`, `401 Unauthorized`.

#### 4.2. Gigs (Services)

*   **`GET /services` - List all services**
    *   **Description:** Retrieves a paginated list of services. Supports filtering, sorting, and pagination.
    *   **Query Parameters:** `page`, `limit`, `sort_by`, `sort_order`, `filter_by_category`, `filter_by_seller_id`, `search` (full-text search on title/description).
    *   **Response (200 OK):**
        ```json
        {
          "status": "success",
          "data": [
            { "Serv Object 1" },
            { "Serv Object 2" }
          ],
          "pagination": {
            "total": 150,
            "page": 1,
            "limit": 10,
            "pages": 15
          }
        }
        ```

*   **`POST /services` - Create a new service**
    *   **Description:** Allows an authenticated `seller` to create a new service.
    *   **Authentication:** Required (User must have `seller` role).
    *   **Request Body:**
        ```json
        {
          "title": "I will write SEO-optimized blog posts",
          "description": "High-quality, engaging content for your website.",
          "category": "Writing & Translation",
          "sub_category": "Article & Blog Post",
          "price": 80.00,
          "currency": "Token",
          "delivery_time_days": 5,
          "revisions_included": 2,
          "cover_image_url": "https://cdn.example.com/services/blog_post_cover.jpg",
          "gallery_image_urls": ["url1", "url2"]
        }
        ```
    *   **Response (201 Created):** Created `Serv Object`.
    *   **Errors:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden` (if not a seller).

*   **`GET /services/{serv_id}` - Get a single service by ID**
    *   **Description:** Retrieves details for a specific service.
    *   **Parameters:** `serv_id` (Path, UUID) - The ID of the service.
    *   **Response (200 OK):** `Serv Object`.
    *   **Errors:** `404 Not Found`.

*   **`PUT /services/{serv_id}` - Update an existing service**
    *   **Description:** Updates details for an existing service. Only the seller who owns the service can update it.
    *   **Authentication:** Required.
    *   **Parameters:** `serv_id` (Path, UUID) - The ID of the service.
    *   **Request Body (Partial update allowed):**
        ```json
        {
          "price": 90.00,
          "delivery_time_days": 4,
          "is_active": false
        }
        ```
    *   **Response (200 OK):** Updated `Serv Object`.
    *   **Errors:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden` (not owner), `404 Not Found`.

*   **`DELETE /services/{serv}` - Delete a service**
    *   **Description:** Deletes a service. Only the seller who owns the service can delete it.
    *   **Authentication:** Required.
    *   **Parameters:** `serv_id` (Path, UUID) - The ID of the service.
    *   **Response (204 No Content):** Successful deletion.
    *   **Errors:** `401 Unauthorized`, `403 Forbidden` (not owner), `404 Not Found`.

#### 4.3. Orders

*   **`POST /orders` - Create a new order**
    *   **Description:** Creates a new order for a service. This typically initiates a payment process.
    *   **Authentication:** Required (User must have `buyer` role).
    *   **Request Body:**
        ```json
        {
          "serv_id": "serv_uuid_456",
          "buyer_requirements": "I need the logo in vector format, include source files."
          /* Potentially include "payment_token": "stripe_token_xyz" if integrating directly */
        }
        ```
    *   **Response (201 Created):** Created `Order Object`.
    *   **Errors:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden` (if not a buyer), `404 Not Found` ( service not found).

*   **`GET /orders/me` - List orders for the current user (buyer or seller)**
    *   **Description:** Retrieves a paginated list of orders where the current user is either the buyer or the seller.
    *   **Authentication:** Required.
    *   **Query Parameters:** `page`, `limit`, `sort_by`, `sort_order`, `filter_by_status` (e.g., `active`, `completed`).
    *   **Response (200 OK):** Paginated list of `Order Object`s.
    *   **Errors:** `401 Unauthorized`.

*   **`GET /orders/{order_id}` - Get a single order by ID**
    *   **Description:** Retrieves details for a specific order. Only accessible to the buyer or seller involved in the order.
    *   **Authentication:** Required.
    *   **Parameters:** `order_id` (Path, UUID) - The ID of the order.
    *   **Response (200 OK):** `Order Object`.
    *   **Errors:** `401 Unauthorized`, `403 Forbidden` (not involved in order), `404 Not Found`.

*   **`PUT /orders/{order_id}/status` - Update order status (for seller)**
    *   **Description:** Allows the seller to update the status of an order, e.g., mark as `delivered`.
    *   **Authentication:** Required (User must be the `seller` of the order).
    *   **Parameters:** `order_id` (Path, UUID) - The ID of the order.
    *   **Request Body:**
        ```json
        {
          "status": "pending_delivery",
          "delivery_notes": "Here is the final design for your logo. Please review and confirm."
          // Optional: "delivery_files": ["url_to_file1", "url_to_file2"]
        }
        ```
    *   **Response (200 OK):** Updated `Order Object`.
    *   **Errors:** `400 Bad Request` (invalid status transition), `401 Unauthorized`, `403 Forbidden` (not seller), `404 Not Found`.

*   **`POST /orders/{order_id}/complete` - Mark order as completed (for buyer)**
    *   **Description:** Allows the buyer to accept the delivery and mark the order as `completed`. This typically triggers payment release.
    *   **Authentication:** Required (User must be the `buyer` of the order).
    *   **Parameters:** `order_id` (Path, UUID) - The ID of the order.
    *   **Response (200 OK):** Updated `Order Object` (`status: completed`).
    *   **Errors:** `400 Bad Request` (order not ready for completion), `401 Unauthorized`, `403 Forbidden` (not buyer), `404 Not Found`.

*   **`POST /orders/{order_id}/cancel` - Request/Accept order cancellation**
    *   **Description:** Allows buyer or seller to request cancellation. Or, if a request exists, for the other party to accept.
    *   **Authentication:** Required.
    *   **Parameters:** `order_id` (Path, UUID) - The ID of the order.
    *   **Request Body (Optional, for initiating):**
        ```json
        {
          "reason": "Buyer provided unclear requirements."
        }
        ```
    *   **Response (200 OK):** Updated `Order Object` (`status: cancellation_requested` or `cancelled`).
    *   **Errors:** `400 Bad Request` (invalid state for cancellation), `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.

#### 4.4. Messaging

*   **`GET /conversations/me` - List current user's conversations**
    *   **Description:** Retrieves a list of conversations the authenticated user is part of.
    *   **Authentication:** Required.
    *   **Response (200 OK):**
        ```json
        {
          "status": "success",
          "data": [
            {
              "id": "conv_uuid_202",
              "participant1_id": "user_uuid_123",
              "participant2_id": "user_uuid_456",
              "last_message_content": "Can we discuss details?",
              "last_message_sent_at": "2023-11-21T15:00:00Z",
              "unread_count": 1, // for current user
              "created_at": "2023-11-20T10:00:00Z"
            }
          ]
        }
        ```

*   **`GET /conversations/{conversation_id}/messages` - Get messages in a conversation**
    *   **Description:** Retrieves all messages within a specific conversation.
    *   **Authentication:** Required.
    *   **Parameters:** `conversation_id` (Path, UUID) - The ID of the conversation.
    *   **Query Parameters:** `page`, `limit` (for message pagination).
    *   **Response (200 OK):** Paginated list of `Message Object`s.
    *   **Errors:** `401 Unauthorized`, `403 Forbidden` (not part of conversation), `404 Not Found`.

*   **`POST /conversations/{conversation_id}/messages` - Send a message in a conversation**
    *   **Description:** Sends a new message within an existing conversation.
    *   **Authentication:** Required.
    *   **Parameters:** `conversation_id` (Path, UUID) - The ID of the conversation.
    *   **Request Body:**
        ```json
        {
          "content": "Sure, I'm available to chat now.",
          "attachments": ["https://cdn.example.com/attachments/design_brief.pdf"] // Optional
        }
        ```
    *   **Response (201 Created):** Created `Message Object`.
    *   **Errors:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden` (not part of conversation), `404 Not Found`.

*   **`POST /messages/start-conversation` - Start a new conversation**
    *   **Description:** Initiates a new conversation between the authenticated user and another user.
    *   **Authentication:** Required.
    *   **Request Body:**
        ```json
        {
          "recipient_id": "user_uuid_456",
          "content": "Hi, I saw your service and wanted to ask a question."
        }
        ```
    *   **Response (201 Created):** Created `Message Object` (first message) and `Conversation Object`.
    *   **Errors:** `400 Bad Request`, `401 Unauthorized`, `404 Not Found` (recipient not found).
    #### 4.5. Admin & Moderator

    This section outlines endpoints specifically for administrative and moderation tasks. Access to these endpoints is restricted based on user roles (`admin`, `moderator`).

    ##### 4.5.1. Admin Endpoints

    *   **`GET /admin/users` - List all users (Admin)**
        *   **Description:** Retrieves a paginated list of all users in the system.
        *   **Authentication:** Required (User must have `admin` role).
        *   **Query Parameters:** `page`, `limit`, `sort_by`, `sort_order`, `filter_by_role`, `search` (on username, email).
        *   **Response (200 OK):** Paginated list of `User Object`s.
            ```json
            {
              "status": "success",
              "data": [ { "User Object 1" }, { "User Object 2" } ],
              "pagination": { "total": 500, "page": 1, "limit": 10, "pages": 50 }
            }
            ```
        *   **Errors:** `401 Unauthorized`, `403 Forbidden`.

    *   **`PUT /admin/users/{user_id}/role` - Update user role (Admin)**
        *   **Description:** Allows an admin to change a user's role (e.g., promote to moderator, change between buyer/seller).
        *   **Authentication:** Required (User must have `admin` role).
        *   **Parameters:** `user_id` (Path, UUID) - The ID of the user to update.
        *   **Request Body:**
            ```json
            {
              "role": "moderator" // e.g., "buyer", "seller", "moderator", "admin"
            }
            ```
        *   **Response (200 OK):** Updated `User Object`.
        *   **Errors:** `400 Bad Request` (invalid role), `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.

    *   **`GET /admin/services` - List all services (Admin)**
        *   **Description:** Retrieves a paginated list of all services in the system, regardless of owner or status. Useful for oversight.
        *   **Authentication:** Required (User must have `admin` role).
        *   **Query Parameters:** `page`, `limit`, `sort_by`, `sort_order`, `filter_by_status` (e.g., `active`, `pending_approval`, `rejected`, `disabled`), `filter_by_seller_id`, `search`.
        *   **Response (200 OK):** Paginated list of `Service Object`s.
        *   **Errors:** `401 Unauthorized`, `403 Forbidden`.

    *   **`PUT /admin/services/{serv_id}/status` - Update service status (Admin)**
        *   **Description:** Allows an admin to directly update the status of any service (e.g., disable, approve, reject).
        *   **Authentication:** Required (User must have `admin` role).
        *   **Parameters:** `serv_id` (Path, UUID) - The ID of the service.
        *   **Request Body:**
            ```json
            {
              "status": "disabled", // e.g., "active", "pending_approval", "rejected", "disabled"
              "admin_notes": "Service disabled due to policy violation review." // Optional
            }
            ```
        *   **Response (200 OK):** Updated `Service Object`.
        *   **Errors:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.

    *   **`GET /admin/platform-stats` - Get platform statistics (Admin)**
        *   **Description:** Retrieves overall platform statistics, such as total users, total services, total orders, revenue data (referencing `Revenue Graph Object`).
        *   **Authentication:** Required (User must have `admin` role).
        *   **Query Parameters:** `from_date`, `to_date` (for time-bound stats).
        *   **Response (200 OK):**
            ```json
            {
              "status": "success",
              "data": {
                "total_users": 1250,
                "roles_count": { "buyer": 950, "seller": 300, "admin": 2, "moderator": 5 },
                "total_services": 800,
                "service_statuses": { "active": 750, "pending_approval": 20, "rejected": 10, "disabled": 20 },
                "total_orders": 5000,
                "order_statuses": { "completed": 4500, "pending_delivery": 200, "cancelled": 300 },
                "revenue_overview": [
                  { "date": "2024-01-01", "revenue": 15000, "orders": 200 },
                  { "date": "2024-02-01", "revenue": 18000, "orders": 220 }
                ]
              }
            }
            ```
        *   **Errors:** `401 Unauthorized`, `403 Forbidden`.

    ##### 4.5.2. Moderator Endpoints

    *   **`GET /moderator/services/pending` - List services pending approval (Moderator)**
        *   **Description:** Retrieves a paginated list of services that are awaiting moderation (e.g., status `pending_approval`).
        *   **Authentication:** Required (User must have `moderator` role).
        *   **Query Parameters:** `page`, `limit`, `sort_by` (e.g., `created_at`).
        *   **Response (200 OK):** Paginated list of `Service Object`s.
        *   **Errors:** `401 Unauthorized`, `403 Forbidden`.

    *   **`POST /moderator/services/{serv_id}/approve` - Approve a service (Moderator)**
        *   **Description:** Allows a moderator to approve a service, changing its status (e.g., to `active`). Uses `Service Approval Object`.
        *   **Authentication:** Required (User must have `moderator` role).
        *   **Parameters:** `serv_id` (Path, UUID) - The ID of the service to approve.
        *   **Response (201 Created):**
            ```json
            {
              "message": "Service approved successfully.",
              "service": { "Updated Service Object with status 'active'" },
              "approval_record": {
                "service_id": "serv_uuid_456",
                "status": "approved",
                "moderator_id": "current_moderator_uuid",
                "approval_date": "YYYY-MM-DDTHH:MM:SSZ"
              }
            }
            ```
        *   **Errors:** `400 Bad Request` (service not in a state to be approved), `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.

    *   **`POST /moderator/services/{serv_id}/reject` - Reject a service (Moderator)**
        *   **Description:** Allows a moderator to reject a service, changing its status (e.g., to `rejected`). Uses `Service Approval Object`.
        *   **Authentication:** Required (User must have `moderator` role).
        *   **Parameters:** `serv_id` (Path, UUID) - The ID of the service to reject.
        *   **Request Body:**
            ```json
            {
              "rejection_reason": "The service content does not meet our quality standards."
            }
            ```
        *   **Response (200 OK):**
            ```json
            {
              "message": "Service rejected successfully.",
              "service": { "Updated Service Object with status 'rejected'" },
              "approval_record": {
                "service_id": "serv_uuid_456",
                "status": "rejected",
                "moderator_id": "current_moderator_uuid",
                "approval_date": "YYYY-MM-DDTHH:MM:SSZ",
                "rejection_reason": "The service content does not meet our quality standards."
              }
            }
            ```
        *   **Errors:** `400 Bad Request` (rejection reason required, service not in a state to be rejected), `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.

    *   **`POST /moderator/users/{user_id}/ban` - Ban a user (Moderator/Admin)**
        *   **Description:** Allows a moderator or admin to ban a user. Admins might have broader ban capabilities.
        *   **Authentication:** Required (User must have `moderator` or `admin` role).
        *   **Parameters:** `user_id` (Path, UUID) - The ID of the user to ban.
        *   **Request Body:**
            ```json
            {
              "reason": "Violation of community guidelines.",
              "duration_hours": 72 // Optional, for temporary bans. If omitted or null, the ban defaults to permanent.
            }
            ```
        *   **Response (200 OK):** Updated `User Object` (e.g., with a `is_banned` flag or `banned_until` timestamp).
        *   **Errors:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.

    *   **`GET /moderator/reports` - View user-submitted reports (Moderator)**
        *   **Description:** Retrieves a list of reports submitted by users (e.g., reporting a service, a user, or a message).
        *   **Authentication:** Required (User must have `moderator` role).
        *   **Query Parameters:** `page`, `limit`, `status` (e.g., `open`, `under_review`, `resolved`), `type` (e.g., `service_report`, `user_report`).
        *   **Response (200 OK):** Paginated list of report objects. (A `Report Object` model would need to be defined, similar to other models).
        *   **Errors:** `401 Unauthorized`, `403 Forbidden`.
    #### 4.6. User Reporting

    This section covers endpoints for users to submit reports and for administrators/moderators to manage these reports. A `Report Object` (to be detailed in Data Models section 3.3) would typically include fields like `id`, `reporter_id`, `reported_entity_type`, `reported_entity_id`, `reason_code`, `details`, `status`, `moderator_notes`, `created_at`, `updated_at`.

    *   **`POST /reports` - Submit a new report**
        *   **Description:** Allows any authenticated user to submit a report against a service, user, message, or order.
        *   **Authentication:** Required.
        *   **Request Body:**
            ```json
            {
              "reported_entity_type": "service", // e.g., "service", "user", "message", "order"
              "reported_entity_id": "entity_uuid_123", // ID of the item/user being reported
              "reason_code": "spam", // Predefined reason code (e.g., "spam", "inappropriate_content", "harassment", "scam", "policy_violation")
              "details": "This service listing appears to be spam and unrelated to the platform's offerings." // Optional: more detailed explanation
            }
            ```
        *   **Response (201 Created):**
            ```json
            {
              "status": "success",
              "message": "Report submitted successfully. It will be reviewed by our moderation team.",
              "data": { "Report Object" } // The created Report Object
            }
            ```
        *   **Errors:** `400 Bad Request` (e.g., invalid `reported_entity_type`, missing required fields), `401 Unauthorized`, `404 Not Found` (if `reported_entity_id` does not exist).

    *   **`GET /admin/reports` - List all reports (Admin)**
        *   **Description:** Retrieves a paginated list of all user-submitted reports. This endpoint is typically for administrators and offers comprehensive filtering.
        *   **Authentication:** Required (User must have `admin` role).
        *   **Query Parameters:** `page`, `limit`, `sort_by`, `sort_order`, `filter_by_status` (e.g., `open`, `under_review`, `resolved_action_taken`), `filter_by_entity_type`, `filter_by_reporter_id`, `filter_by_reported_entity_id`.
        *   **Response (200 OK):** Paginated list of `Report Object`s.
            ```json
            {
              "status": "success",
              "data": [
                { "Report Object 1" },
                { "Report Object 2" }
              ],
              "pagination": {
                "total": 50,
                "page": 1,
                "limit": 10,
                "pages": 5
              }
            }
            ```
        *   **Errors:** `401 Unauthorized`, `403 Forbidden`.

    *   **`GET /reports/{report_id}` - Get a specific report (Admin/Moderator)**
        *   **Description:** Retrieves detailed information about a specific report.
        *   **Authentication:** Required (User must have `admin` or `moderator` role).
        *   **Parameters:** `report_id` (Path, UUID) - The ID of the report.
        *   **Response (200 OK):** `Report Object`.
        *   **Errors:** `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.

    *   **`PUT /reports/{report_id}/status` - Update report status (Admin/Moderator)**
        *   **Description:** Allows an Admin or Moderator to update the status of a report and add internal notes.
        *   **Authentication:** Required (User must have `admin` or `moderator` role).
        *   **Parameters:** `report_id` (Path, UUID) - The ID of the report.
        *   **Request Body:**
            ```json
            {
              "status": "under_review", // e.g., "open", "under_review", "resolved_action_taken", "resolved_no_action_needed", "escalated"
              "moderator_notes": "Assigned to moderator_jane. Initial review suggests further investigation." // Optional
            }
            ```
        *   **Response (200 OK):** Updated `Report Object`.
        *   **Errors:** `400 Bad Request` (invalid status value), `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.


### 5. Changelog

*   **v1.0.0 (2025-05-25)**
    *   Initial public release of the Freeland API.
    *   Core functionalities for users, services, orders, and messaging implemented.
