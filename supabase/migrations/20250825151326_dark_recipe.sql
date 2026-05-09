/*
  # Fix RLS policy for books table

  1. Security Changes
    - Drop existing restrictive RLS policy on books table
    - Create new policy allowing all operations for authenticated users
    - Ensure authenticated users can perform CRUD operations on books

  2. Policy Details
    - Allow SELECT, INSERT, UPDATE, DELETE for authenticated users
    - Uses auth.uid() IS NOT NULL to verify authentication
    - Covers all necessary operations for product management
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON books;

-- Create comprehensive policy for authenticated users
CREATE POLICY "Allow all operations for authenticated users"
  ON books
  FOR ALL
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Ensure RLS is enabled on books table
ALTER TABLE books ENABLE ROW LEVEL SECURITY;