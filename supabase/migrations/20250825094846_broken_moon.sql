/*
  # Insert Default Admin User
  
  1. New Admin User
    - Creates a default admin user with encrypted password
    - Username: admin
    - Password: admin123 (encrypted with bcrypt)
    - Role: super_admin
    - Active status: true
  
  2. Security
    - Password is properly hashed using bcrypt
    - User has super_admin privileges
*/

-- First, let's check if the admin user already exists and delete if present
DELETE FROM admin_users WHERE username = 'admin';

-- Insert the admin user with bcrypt hashed password
-- Password: admin123
-- Bcrypt hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
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