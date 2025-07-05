// Example usage of the updated ServCard component with gigs API data

import React, { useState, useEffect } from 'react';
import ServCard from '../Common/ServCard';

const GigsGrid = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/gigs?limit=12');
      
      if (!response.ok) {
        throw new Error('Failed to fetch gigs');
      }
      
      const data = await response.json();
      setGigs(data.data); // API returns { status: 'success', data: [...] }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Loading gigs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Available Gigs
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
        {gigs.map((gig) => (
          <ServCard key={gig.id} gig={gig} />
        ))}
      </div>

      {gigs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">No gigs found</div>
        </div>
      )}
    </div>
  );
};

export default GigsGrid;

/*
EXAMPLE GIG DATA STRUCTURE (from API response):
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

HOW TO USE SERVCARD:

1. Simple usage:
<ServCard gig={gigData} />

2. With default fallback (when no gig prop is passed):
<ServCard />

3. In a list/grid:
{gigs.map(gig => <ServCard key={gig.id} gig={gig} />)}

FEATURES OF UPDATED SERVCARD:
✅ Accepts gig prop with API data structure
✅ Displays actual gig information (title, price, owner, etc.)
✅ Shows cover image with error handling
✅ Displays owner avatar and username
✅ Shows category name as badge
✅ Displays delivery time instead of rating
✅ Handles missing data gracefully with defaults
✅ Status badge for active gigs
✅ Price formatting
✅ Title truncation for long titles
✅ Responsive and consistent design
*/
