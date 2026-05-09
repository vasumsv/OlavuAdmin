-- Fix orders RLS policies for status updates
-- Drop all existing policies
DROP POLICY IF EXISTS "anonymous_insert" ON orders;
DROP POLICY IF EXISTS "anonymous_read_create" ON orders;
DROP POLICY IF EXISTS "authenticated_users_full_access" ON orders;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON orders;

-- Disable RLS temporarily to ensure updates work
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with simple policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (admins)
CREATE POLICY "admin_full_access" ON orders
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to create and read orders (for customers)
CREATE POLICY "customer_create_orders" ON orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "customer_read_orders" ON orders
  FOR SELECT
  TO anon
  USING (true);