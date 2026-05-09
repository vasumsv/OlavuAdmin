/*
  # Fix Categories RLS Policy

  1. Security Updates
    - Drop existing restrictive policy
    - Create new policy allowing all operations for authenticated users
    - Ensure admin users can manage categories properly

  2. Changes
    - Remove overly restrictive RLS policy
    - Add comprehensive policy for authenticated users
    - Allow INSERT, UPDATE, DELETE, SELECT operations
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admin users can manage categories" ON categories;

-- Create a new policy that allows all operations for authenticated users
CREATE POLICY "Authenticated users can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;