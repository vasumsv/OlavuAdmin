/*
  # Delete all orders from database

  1. Delete Operations
    - Delete all order items first (due to foreign key constraints)
    - Delete all orders
    - Reset any related counters or analytics data

  2. Clean Up
    - Reset customer order counts and totals
    - Clear analytics data related to orders
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

-- Clear analytics data
DELETE FROM analytics_daily;

-- Reset any sequences if needed (PostgreSQL auto-generates order numbers)
-- This ensures next order starts from a clean state