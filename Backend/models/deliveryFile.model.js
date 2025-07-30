/**
 * Delivery File Model - Handles database operations for delivery files
 * 
 * @file deliveryFile.model.js
 * @description Model for managing delivery file data in the DeliveryFiles table
 * 
 * @requires ../config/supabaseClient - Supabase client for database operations
 */

const supabase = require('../config/supabaseClient');

const DeliveryFile = {
  /**
   * Create delivery file record
   * 
   * @param {Object} fileData - File data
   * @returns {Promise<Object>} Created file record
   */
  create: async (fileData) => {
    // Ensure all required fields are present for database
    const dbData = {
      order_id: fileData.order_id,
      original_name: fileData.original_name,
      file_name: fileData.file_name || fileData.original_name, // Use original_name if file_name not provided
      file_size: fileData.file_size,
      file_type: fileData.file_type,
      storage_path: fileData.storage_path,
      uploaded_by: fileData.uploaded_by,
      upload_status: fileData.upload_status || 'uploaded'
    };

    // Add message if provided (store in JSON format for now since column doesn't exist)
    if (fileData.message) {
      dbData.original_name = `${dbData.original_name}|||MSG:${fileData.message}`;
    }

    const { data, error } = await supabase
      .from('DeliveryFiles')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating delivery file: ${error.message}`);
    }

    return data;
  },

  /**
   * Get delivery files by order ID
   * 
   * @param {string} orderId - Order ID
   * @returns {Promise<Array>} Array of delivery files
   */
  findByOrderId: async (orderId) => {
    const { data, error } = await supabase
      .from('DeliveryFiles')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching delivery files: ${error.message}`);
    }

    // Process data to extract message from original_name
    const processedData = (data || []).map(file => {
      const { original_name } = file;
      if (original_name && original_name.includes('|||MSG:')) {
        const [realName, message] = original_name.split('|||MSG:');
        return {
          ...file,
          original_name: realName,
          message: message || null
        };
      }
      return {
        ...file,
        message: null
      };
    });

    return processedData;
  },

  /**
   * Update delivery file
   * 
   * @param {string} fileId - File ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated file record
   */
  update: async (fileId, updateData) => {
    const { data, error } = await supabase
      .from('DeliveryFiles')
      .update(updateData)
      .eq('id', fileId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating delivery file: ${error.message}`);
    }

    return data;
  },

  /**
   * Delete delivery file
   * 
   * @param {string} fileId - File ID
   * @returns {Promise<boolean>} Success status
   */
  delete: async (fileId) => {
    const { error } = await supabase
      .from('DeliveryFiles')
      .delete()
      .eq('id', fileId);

    if (error) {
      throw new Error(`Error deleting delivery file: ${error.message}`);
    }

    return true;
  }
};

module.exports = DeliveryFile;
