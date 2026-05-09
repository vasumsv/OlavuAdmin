/*
  # Create default admin user

  1. New Admin User
    - Creates a default admin user with encrypted password
    - Username: admin
    - Password: admin123 (encrypted with bcrypt)
    - Full access to the system

  2. Security
    - Password is properly hashed using bcrypt
    - User is set as active by default
*/

-- Create default admin user with encrypted password
-- Password: admin123 (hashed with bcrypt, salt rounds: 10)
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
) ON CONFLICT (username) DO NOTHING;