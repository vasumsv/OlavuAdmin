/*
  # Create Demo Admin User

  1. New Tables
    - Ensures `admin_users` table exists with demo user
  2. Security
    - Creates demo admin user with simple password encoding
    - Sets up proper user data for testing
*/

-- Ensure the admin_users table exists (in case it doesn't)
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Delete existing demo users to avoid conflicts
DELETE FROM admin_users WHERE username IN ('admin', 'superadmin');

-- Insert demo admin user with simple base64 encoded password
-- Password: admin123 -> base64 encoded
INSERT INTO admin_users (
  username,
  password_hash,
  full_name,
  email,
  role,
  is_active
) VALUES (
  'admin',
  'YWRtaW4xMjM=',  -- This is 'admin123' base64 encoded
  'System Administrator',
  'admin@olavubooks.com',
  'admin',
  true
);

-- Also create a superadmin user as backup
INSERT INTO admin_users (
  username,
  password_hash,
  full_name,
  email,
  role,
  is_active
) VALUES (
  'superadmin',
  'YWRtaW4xMjM=',  -- This is 'admin123' base64 encoded
  'Super Administrator',
  'superadmin@olavubooks.com',
  'super_admin',
  true
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON admin_users;
CREATE POLICY "Enable all operations for authenticated users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Also allow anonymous access for login
DROP POLICY IF EXISTS "Enable read access for authentication" ON admin_users;
CREATE POLICY "Enable read access for authentication"
  ON admin_users
  FOR SELECT
  TO anon, authenticated
  USING (true);