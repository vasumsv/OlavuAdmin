/*
  # Fix RLS policies for coupons table

  1. Security Changes
    - Drop existing restrictive policies
    - Create simple policies for authenticated users
    - Allow all operations for authenticated users
    - Allow read access for anonymous users (for checkout)

  2. Policies
    - Authenticated users can perform all CRUD operations
    - Anonymous users can read active, non-expired coupons
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin users can manage all coupons" ON coupons;
DROP POLICY IF EXISTS "Public can view active coupons" ON coupons;
DROP POLICY IF EXISTS "Customers can view active coupons" ON coupons;
DROP POLICY IF EXISTS "Admins can manage all coupons" ON coupons;

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to do everything
CREATE POLICY "Authenticated users can manage coupons"
ON coupons
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy 2: Allow anonymous users to read active coupons (for checkout)
CREATE POLICY "Public can view active coupons"
ON coupons
FOR SELECT
TO anon
USING (is_active = true AND expiry_date >= CURRENT_DATE);