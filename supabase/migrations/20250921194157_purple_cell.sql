/*
  # Add Admin User

  1. New Admin User
    - Username: admin
    - Password: admin123 (base64 encoded)
    - Full Name: Administrator
    - Email: admin@olavubooks.com
    - Role: super_admin
    - Active status: true

  2. Security
    - Password is base64 encoded for basic security
    - User is set as super_admin with full access
*/

INSERT INTO admin_users (
  username,
  password_hash,
  full_name,
  email,
  role,
  is_active
) VALUES (
  'admin',
  'YWRtaW4xMjM=',
  'Administrator',
  'admin@olavubooks.com',
  'super_admin',
  true
) ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = now();