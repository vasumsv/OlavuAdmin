/*
  # Update admin user with encrypted password

  1. Updates
    - Update admin user password with simple encrypted version
    - Password "admin123" is encrypted using XOR cipher and base64 encoded

  2. Security
    - Uses simple encryption that can be decrypted in frontend
    - Maintains existing RLS policies
*/

-- Update admin user with encrypted password
UPDATE admin_users 
SET password_hash = 'FgMHBQcBBgcF'
WHERE username = 'admin';

-- If admin doesn't exist, create it
INSERT INTO admin_users (
  username,
  password_hash,
  full_name,
  email,
  role,
  is_active
) 
SELECT 
  'admin',
  'FgMHBQcBBgcF',
  'System Administrator',
  'admin@olavubooks.com',
  'super_admin',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM admin_users WHERE username = 'admin'
);