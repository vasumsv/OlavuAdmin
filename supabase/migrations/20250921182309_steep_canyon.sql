/*
  # Delete All Orders Data

  This migration removes all order-related data from the database while preserving table structures.
  
  ## What this does:
  1. Deletes all order items (foreign key constraint requires this first)
  2. Deletes all orders
  3. Resets customer order statistics
  4. Clears daily analytics data
  
  ## Tables affected:
  - order_items (all data deleted)
  - orders (all data deleted) 
  - customers (order stats reset to 0)
  - analytics_daily (all data deleted)
  
  ## Note:
  - Table structures are preserved
  - Customer data is preserved (only order stats reset)
  - Product data is unaffected
  - Categories and other data unaffected
*/

-- Delete all order items first (due to foreign key constraints)
DELETE FROM order_items;

-- Delete all orders
DELETE FROM orders;

-- Reset customer order statistics
UPDATE customers 
SET 
  total_orders = 0,
  total_spent = 0,
  last_order_date = NULL,
  updated_at = now();

-- Clear analytics data (since it's based on orders)
DELETE FROM analytics_daily;

-- Log the cleanup
DO $$
BEGIN
  RAISE NOTICE 'All order data has been successfully deleted';
  RAISE NOTICE 'Customer order statistics have been reset';
  RAISE NOTICE 'Analytics data has been cleared';
END $$;