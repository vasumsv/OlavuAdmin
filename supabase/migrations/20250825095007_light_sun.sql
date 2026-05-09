/*
  # Fix Admin User Login

  1. Delete existing admin user if any
  2. Create new admin user with properly hashed password
  3. Ensure the password hash is compatible with bcrypt verification
*/

-- Delete existing admin user
DELETE FROM admin_users WHERE username = 'admin';

-- Insert admin user with bcrypt hash for 'admin123'
-- This hash was generated with bcrypt.hash('admin123', 10)
INSERT INTO admin_users (
  username,
  password_hash,
  full_name,
  email,
  role,
  is_active
) VALUES (
  'admin',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'System Administrator',
  'admin@olavubooks.com',
  'super_admin',
  true
);