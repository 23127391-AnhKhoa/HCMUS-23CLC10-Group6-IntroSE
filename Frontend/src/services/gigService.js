/**
 * Gig Service - Handles all gig-related API calls
 * This service layer abstracts API communication from components
 */

const API_BASE_URL = 'http://localhost:8000/api';

class GigService {
  /**
   * Get all gigs for a seller with statistics
   * @param {string} sellerId - The seller's UUID
   * @param {string} token - JWT authentication token
   * @returns {Promise<Object>} API response with gigs and stats
   */
  static async getSellerGigsWithStats(sellerId, token) {
    try {
      console.log('🔍 GigService: Fetching gigs with stats for seller:', sellerId);

      const response = await fetch(`${API_BASE_URL}/gigs/seller/${sellerId}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ GigService: Gigs data with stats received:', data);

      if (data.status === 'success') {
        return {
          success: true,
          data: data.data || [],
          message: data.message
        };
      } else {
        throw new Error(data.message || 'Failed to fetch gigs');
      }
    } catch (error) {
      console.error('💥 GigService: Error fetching gigs:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Update gig status (pause, activate, delete)
   * @param {string} gigId - The gig ID to update
   * @param {string} status - New status ('active', 'paused', 'deleted')
   * @param {string} token - JWT authentication token
   * @returns {Promise<Object>} API response
   */
  static async updateGigStatus(gigId, status, token) {
    try {
      console.log(`🔄 GigService: Updating gig ${gigId} status to:`, status);
      
      const response = await fetch(`${API_BASE_URL}/gigs/${gigId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      console.log('📡 GigService: Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ GigService: ${status} response:`, data);
        return {
          success: true,
          data: data.data,
          message: data.message
        };
      } else {
        const errorData = await response.json();
        console.error(`❌ GigService: ${status} failed:`, errorData);
        return {
          success: false,
          error: errorData.message || `Failed to ${status} gig`,
          data: null
        };
      }
    } catch (error) {
      console.error(`💥 GigService: Error updating gig status to ${status}:`, error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Pause a gig
   * @param {string} gigId - The gig ID to pause
   * @param {string} token - JWT authentication token
   * @returns {Promise<Object>} API response
   */
  static async pauseGig(gigId, token) {
    return this.updateGigStatus(gigId, 'paused', token);
  }

  /**
   * Activate a gig
   * @param {string} gigId - The gig ID to activate
   * @param {string} token - JWT authentication token
   * @returns {Promise<Object>} API response
   */
  static async activateGig(gigId, token) {
    return this.updateGigStatus(gigId, 'active', token);
  }

  /**
   * Delete a gig (soft delete by changing status)
   * @param {string} gigId - The gig ID to delete
   * @param {string} token - JWT authentication token
   * @returns {Promise<Object>} API response
   */
  static async deleteGig(gigId, token) {
    return this.updateGigStatus(gigId, 'deleted', token);
  }

  /**
   * Get gig statistics with fallback mock data
   * @param {Object} gig - The gig object
   * @returns {Object} Statistics object
   */
  static getGigStats(gig) {
    // Return real statistics from API if available, otherwise fallback to mock data
    if (gig.statistics) {
      return gig.statistics;
    }
    
    // Fallback mock data for development/testing
    return {
      impressions: Math.floor(Math.random() * 2000) + 500,
      clicks: Math.floor(Math.random() * 500) + 100,
      orders: Math.floor(Math.random() * 50) + 5,
      cancellations: Math.floor(Math.random() * 5),
      earnings: Math.floor(Math.random() * 1000) + 200
    };
  }

  /**
   * Filter gigs by status
   * @param {Array} gigs - Array of gig objects
   * @param {string} status - Status to filter by ('active', 'paused', 'pending', 'denied')
   * @returns {Array} Filtered gigs array
   */
  static filterGigsByStatus(gigs, status) {
    if (!gigs || !Array.isArray(gigs)) return [];
    
    switch (status) {
      case 'active':
        return gigs.filter(gig => gig.status === 'active');
      case 'paused':
        return gigs.filter(gig => gig.status === 'paused');
      case 'pending':
        return gigs.filter(gig => gig.status === 'pending');
      case 'denied':
        return gigs.filter(gig => gig.status === 'denied');
      default:
        return gigs;
    }
  }

  /**
   * Calculate summary statistics for filtered gigs
   * @param {Array} gigs - Array of gig objects
   * @returns {Object} Summary statistics
   */
  static calculateSummaryStats(gigs) {
    if (!gigs || !Array.isArray(gigs)) {
      return { totalGigs: 0, totalOrders: 0, totalEarnings: 0 };
    }

    return {
      totalGigs: gigs.length,
      totalOrders: gigs.reduce((sum, gig) => sum + (this.getGigStats(gig).orders || 0), 0),
      totalEarnings: gigs.reduce((sum, gig) => sum + (this.getGigStats(gig).earnings || 0), 0)
    };
  }
}

export default GigService;
