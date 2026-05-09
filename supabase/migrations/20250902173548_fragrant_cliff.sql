/*
  # Update customer revenue calculation for delivered orders only

  1. Updates
    - Update all customer total_spent to only include delivered orders
    - Update total_orders to only count delivered orders
    - Update last_order_date to only consider delivered orders

  2. Security
    - No RLS changes needed for this data update

  3. Notes
    - This ensures revenue metrics only reflect completed transactions
    - Customers stats will be more accurate for business reporting
*/

-- Update customer statistics to only include delivered orders
UPDATE customers 
SET 
  total_spent = COALESCE((
    SELECT SUM(o.total_amount) 
    FROM orders o 
    WHERE o.customer_id = customers.id 
    AND o.status = 'delivered'
  ), 0),
  total_orders = COALESCE((
    SELECT COUNT(*) 
    FROM orders o 
    WHERE o.customer_id = customers.id 
    AND o.status = 'delivered'
  ), 0),
  last_order_date = (
    SELECT MAX(o.delivered_at) 
    FROM orders o 
    WHERE o.customer_id = customers.id 
    AND o.status = 'delivered'
  ),
  updated_at = now()
WHERE EXISTS (
  SELECT 1 FROM orders o 
  WHERE o.customer_id = customers.id
);