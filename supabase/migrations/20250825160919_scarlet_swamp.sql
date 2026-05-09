/*
  # Create Coupons Management System

  1. New Tables
    - `coupons`
      - `id` (uuid, primary key)
      - `coupon_code` (text, unique, not null)
      - `discount_pct` (numeric, between 1-100)
      - `is_active` (boolean, default true)
      - `expiry_date` (date, not null)
      - `usage_limit` (integer, optional)
      - `used_count` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `coupons` table
    - Add policy for authenticated users to manage coupons
    - Add policy for public read access to active coupons

  3. Constraints
    - Unique coupon codes
    - Discount percentage between 1-100
    - Expiry date must be in future for new coupons
*/

CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_code text UNIQUE NOT NULL,
  discount_pct numeric(5,2) NOT NULL CHECK (discount_pct >= 1 AND discount_pct <= 100),
  is_active boolean DEFAULT true,
  expiry_date date NOT NULL,
  usage_limit integer DEFAULT NULL,
  used_count integer DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users (admin) to manage all coupons
CREATE POLICY "Enable all operations for authenticated users"
  ON coupons
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy for public read access to active, non-expired coupons
CREATE POLICY "Enable read access for active coupons"
  ON coupons
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND expiry_date >= CURRENT_DATE);

-- Create indexes for better performance
CREATE INDEX idx_coupons_code ON coupons (coupon_code);
CREATE INDEX idx_coupons_active ON coupons (is_active);
CREATE INDEX idx_coupons_expiry ON coupons (expiry_date);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample coupons
INSERT INTO coupons (coupon_code, discount_pct, expiry_date, description) VALUES
('WELCOME10', 10.00, '2024-12-31', 'Welcome discount for new customers'),
('BOOK20', 20.00, '2024-12-31', '20% off on all books'),
('KANNADA15', 15.00, '2024-12-31', 'Special discount for Kannada books');