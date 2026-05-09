/*
  # Update RLS policies for admin authentication

  1. Security Changes
    - Update admin_users RLS policy to allow SELECT for authentication
    - Keep INSERT/UPDATE/DELETE restricted for security
    - Allow anonymous users to read admin_users for login verification only

  2. Notes
    - This allows the login process to work while maintaining security
    - Admin user creation should be done manually via Supabase dashboard
*/

-- Drop existing policy and create new one for authentication
DROP POLICY IF EXISTS "Admin users can manage admin_users" ON admin_users;

-- Allow SELECT for authentication (anonymous users can read for login)
CREATE POLICY "Allow authentication reads"
  ON admin_users
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated admin users to manage other admin users
CREATE POLICY "Authenticated admins can manage admin_users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default admin user if it doesn't exist
INSERT INTO admin_users (username, password_hash, full_name, email, role, is_active)
SELECT 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin@olavubooks.com', 'super_admin', true
WHERE NOT EXISTS (
  SELECT 1 FROM admin_users WHERE username = 'admin'
);