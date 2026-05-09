/*
  # Fix categories table RLS policy

  1. Security Updates
    - Drop existing restrictive policies on categories table
    - Create new policy allowing all operations for authenticated users
    - Ensure proper access control for category management

  2. Changes
    - Remove overly restrictive RLS policies
    - Add comprehensive policy for authenticated users
    - Allow INSERT, SELECT, UPDATE, DELETE operations
*/

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON categories;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON categories;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON categories;

-- Create a comprehensive policy for authenticated users
CREATE POLICY "Allow all operations for authenticated users"
  ON categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;