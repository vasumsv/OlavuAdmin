/*
  # Fix RLS policy for books table with admin user validation

  1. Security Changes
    - Drop existing restrictive policy that was blocking operations
    - Create comprehensive policy that validates admin users
    - Check if authenticated user exists in admin_users table
    - Verify user has admin role and is active
    - Allow all CRUD operations for valid admin users

  2. Policy Logic
    - USING clause: Allows reading records if user is valid admin
    - WITH CHECK clause: Allows creating/updating records if user is valid admin
    - Covers SELECT, INSERT, UPDATE, DELETE operations
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON books;

-- Create a comprehensive policy that checks admin_users table
CREATE POLICY "Allow all operations for admin users"
  ON books
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.jwt() ->> 'email'
      AND admin_users.is_active = true
      AND admin_users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.jwt() ->> 'email'
      AND admin_users.is_active = true
      AND admin_users.role = 'admin'
    )
  );