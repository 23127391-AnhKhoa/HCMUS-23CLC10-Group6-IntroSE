// Example usage of the Gigs API endpoints (Updated for actual database schema)

/*
=== GIGS API ENDPOINTS ===
Database Schema: public."Gigs" table with the following fields:
- id (uuid, primary key)
- owner_id (uuid, foreign key to User.uuid)
- status (text) - e.g., 'active', 'inactive', 'pending'
- title (text)
- cover_image (text) - URL to cover image
- description (text)
- price (numeric)
- delivery_days (integer)
- num_of_edits (integer, nullable)
- created_at (timestamp)
- updated_at (timestamp, nullable)
- category_id (bigint, foreign key to Categories.id)

1. GET /api/gigs - Get all gigs (with pagination and filtering)
   
   Query Parameters:
   - page: Page number (default: 1)
   - limit: Items per page (default: 10)
   - sort_by: Field to sort by (default: 'created_at')
   - sort_order: 'asc' or 'desc' (default: 'desc')
   - filter_by_category_id: Filter by category ID
   - filter_by_owner_id: Filter by gig owner UUID
   - filter_by_status: Filter by status (default: 'active')
   - search: Search in title and description

   Examples:
   - GET /api/gigs
   - GET /api/gigs?page=1&limit=5
   - GET /api/gigs?search=logo design
   - GET /api/gigs?filter_by_category_id=1
   - GET /api/gigs?filter_by_owner_id=user_uuid_123
   - GET /api/gigs?filter_by_status=active
   - GET /api/gigs?sort_by=price&sort_order=asc

   Response:
   {
     "status": "success",
     "data": [
       {
         "id": "gig_uuid_456",
         "owner_id": "user_uuid_123",
         "status": "active",
         "title": "I will design a stunning logo for your brand",
         "cover_image": "https://cdn.example.com/covers/logo_design.jpg",
         "description": "Professional logo design services...",
         "price": 50.00,
         "delivery_days": 3,
         "num_of_edits": 2,
         "created_at": "2023-03-01T09:00:00Z",
         "updated_at": "2023-11-18T11:00:00Z",
         "category_id": 1,
         "owner_username": "john_doe",
         "owner_fullname": "John Doe",
         "owner_avatar": "https://...",
         "owner_bio": "Professional designer...",
         "category_name": "Design & Creative",
         "category_description": "Creative design services"
       }
     ],
     "pagination": {
       "total": 150,
       "page": 1,
       "limit": 10,
       "pages": 15
     }
   }

2. GET /api/gigs/:id - Get a single gig by ID

   Example: GET /api/gigs/gig_uuid_456

   Response:
   {
     "status": "success",
     "data": {
       "id": "gig_uuid_456",
       "owner_id": "user_uuid_123",
       "status": "active",
       "title": "I will design a stunning logo for your brand",
       "cover_image": "https://cdn.example.com/covers/logo_design.jpg",
       "description": "Professional logo design services...",
       "price": 50.00,
       "delivery_days": 3,
       "num_of_edits": 2,
       "created_at": "2023-03-01T09:00:00Z",
       "updated_at": "2023-11-18T11:00:00Z",
       "category_id": 1,
       "owner_username": "john_doe",
       "owner_fullname": "John Doe",
       "owner_avatar": "https://...",
       "owner_bio": "Experienced designer...",
       "category_name": "Design & Creative",
       "category_description": "Creative design services"
     }
   }

3. POST /api/gigs - Create a new gig

   Required fields: title, cover_image, description, price, delivery_days, category_id

   Request Body:
   {
     "owner_id": "user_uuid_123", // Will come from auth middleware
     "status": "active",
     "title": "I will write SEO-optimized blog posts",
     "cover_image": "https://cdn.example.com/covers/blog_writing.jpg",
     "description": "High-quality, engaging content for your website.",
     "price": 80.00,
     "delivery_days": 5,
     "num_of_edits": 3,
     "category_id": 2
   }

   Response:
   {
     "status": "success",
     "data": { ...created gig object }
   }

4. PUT /api/gigs/:id - Update an existing gig

   Request Body (partial update allowed):
   {
     "title": "Updated title",
     "price": 90.00,
     "delivery_days": 4,
     "status": "inactive"
   }

   Response:
   {
     "status": "success",
     "data": { ...updated gig object }
   }

5. DELETE /api/gigs/:id - Delete a gig

   Response: 204 No Content

=== ERROR RESPONSES ===

All endpoints return errors in this format:
{
  "status": "error",
  "message": "Error description"
}

Common error codes:
- 400 Bad Request: Invalid input data or missing required fields
- 404 Not Found: Gig not found
- 401 Unauthorized: Authentication required (when auth is implemented)
- 403 Forbidden: Not authorized to perform action

=== DATABASE RELATIONSHIPS ===

The Gigs table has foreign key relationships with:
- User table (owner_id → User.uuid)
- Categories table (category_id → Categories.id)

=== FEATURES ===

✅ Get all gigs with pagination and filtering
✅ Filter by category_id, owner_id, or status
✅ Search by title and description
✅ Sort by any field (price, created_at, delivery_days, etc.)
✅ Get single gig with owner and category information
✅ Create new gig with validation
✅ Update existing gig (partial updates supported)
✅ Delete gig
✅ Include owner and category information in responses
✅ Proper error handling and validation
✅ Consistent API response format
✅ Automatic timestamp handling (created_at, updated_at)

TODO (for future implementation):
- Authentication middleware to auto-populate owner_id
- Authorization checks (only owner can update/delete their gigs)
- Image upload handling for cover_image
- Gig approval workflow (pending → active)
- Rating/review system integration
- Soft delete option (status = 'deleted' instead of hard delete)
*/
