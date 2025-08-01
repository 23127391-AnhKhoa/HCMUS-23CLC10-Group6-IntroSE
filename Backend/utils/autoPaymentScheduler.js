/**
 * Scheduler for Auto Payment Processing
 * 
 * @file autoPaymentScheduler.js
 * @description Schedules and runs periodic checks for auto payment processing
 */

const cron = require('node-cron');
const AutoPaymentService = require('../services/autoPayment.service');

/**
 * Initialize auto payment scheduler
 * Runs every 5 minutes to check for expired response deadlines
 */
const initializeAutoPaymentScheduler = () => {
  console.log('🕐 [Auto Payment Scheduler] Initializing...');
  
  // Run every 5 minutes for more accurate processing
  cron.schedule('*/5 * * * *', async () => {
    console.log('🔄 [Auto Payment Scheduler] Running auto payment check...');
    
    try {
      await AutoPaymentService.checkAllPendingAutoPayments();
      console.log('✅ [Auto Payment Scheduler] Auto payment check completed');
    } catch (error) {
      console.error('❌ [Auto Payment Scheduler] Error during auto payment check:', error);
    }
  });

  // Also run on startup to catch any missed payments
  setTimeout(async () => {
    console.log('🚀 [Auto Payment Scheduler] Running initial auto payment check...');
    try {
      await AutoPaymentService.checkAllPendingAutoPayments();
      console.log('✅ [Auto Payment Scheduler] Initial auto payment check completed');
    } catch (error) {
      console.error('❌ [Auto Payment Scheduler] Error during initial auto payment check:', error);
    }
  }, 5000); // Wait 5 seconds after startup

  console.log('✅ [Auto Payment Scheduler] Initialized successfully');
};

module.exports = {
  initializeAutoPaymentScheduler
};
