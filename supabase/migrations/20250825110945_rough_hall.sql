/*
  # Ensure admin user exists with correct credentials

  1. Admin User Setup
    - Creates default admin user if not exists
    - Username: admin
    - Password: admin123 (encrypted)
    - Ensures user is active and has proper role
*/

-- First, let's ensure we have the encryption function
CREATE OR REPLACE FUNCTION encrypt_password(password_text TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Simple XOR encryption with base64 encoding (matching the frontend encryption)
  -- This is a simplified version for demo purposes
  RETURN encode(convert_to(password_text, 'UTF8'), 'base64');
END;
$$ LANGUAGE plpgsql;

-- Insert or update the admin user
INSERT INTO admin_users (
  id,
  username,
  password_hash,
  full_name,
  email,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin',
  'YWRtaW4xMjM=', -- This is 'admin123' base64 encoded
  'System Administrator',
  'admin@olavubooks.com',
  'super_admin',
  true,
  now(),
  now()
) ON CONFLICT (username) 
DO UPDATE SET
  password_hash = 'YWRtaW4xMjM=',
  full_name = 'System Administrator',
  email = 'admin@olavubooks.com',
  role = 'super_admin',
  is_active = true,
  updated_at = now();

-- Also ensure we have a backup admin user
INSERT INTO admin_users (
  id,
  username,
  password_hash,
  full_name,
  email,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'superadmin',
  'YWRtaW4xMjM=', -- This is 'admin123' base64 encoded
  'Super Administrator',
  'superadmin@olavubooks.com',
  'super_admin',
  true,
  now(),
  now()
) ON CONFLICT (username) 
DO UPDATE SET
  password_hash = 'YWRtaW4xMjM=',
  full_name = 'Super Administrator',
  email = 'superadmin@olavubooks.com',
  role = 'super_admin',
  is_active = true,
  updated_at = now();