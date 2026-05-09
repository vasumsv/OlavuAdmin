/*
  # Implement Proper RLS for Coupons Table

  1. Security Setup
    - Enable RLS on coupons table
    - Create policy for authenticated admin users to manage all coupons
    - Create policy for public to read active coupons (for checkout validation)
    
  2. Admin Access
    - Admins (from admin_users table) get full CRUD access
    - Uses auth.uid() to match with admin_users.id
    
  3. Public Access
    - Anonymous users can read active, non-expired coupons for checkout
    - Prevents access to inactive or expired coupons
*/

-- First, ensure RLS is enabled
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON coupons;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON coupons;
DROP POLICY IF EXISTS "Customers can view active coupons" ON coupons;
DROP POLICY IF EXISTS "Admins can manage all coupons" ON coupons;

-- Policy 1: Allow authenticated admin users to manage all coupons
CREATE POLICY "Admin users can manage all coupons"
ON coupons
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- Policy 2: Allow public read access to active coupons (for checkout validation)
CREATE POLICY "Public can view active coupons"
ON coupons
FOR SELECT
TO anon, authenticated
USING (
  is_active = true 
  AND expiry_date >= CURRENT_DATE
);

-- Grant necessary permissions
GRANT SELECT ON coupons TO anon;
GRANT ALL ON coupons TO authenticated;