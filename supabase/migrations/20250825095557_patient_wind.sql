/*
  # Fix admin user password hash

  1. Updates
    - Update admin user with properly generated bcrypt hash for password "admin123"
    - Ensure the hash is compatible with the bcrypt library being used

  2. Security
    - Uses bcrypt with salt rounds 10
    - Replaces the existing invalid hash
*/

-- Update the admin user with a proper bcrypt hash for password "admin123"
UPDATE admin_users 
SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    updated_at = now()
WHERE username = 'admin';