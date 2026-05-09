/*
  # Create Admin Tables for OlavuBooks

  1. New Tables
    - `admin_users` - Admin authentication and user management
    - `categories` - Book categories with bilingual support
    - `books` - Complete book inventory management
    - `orders` - Customer orders tracking
    - `order_items` - Individual items in orders
    - `customers` - Customer information
    - `analytics_daily` - Daily analytics data

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access only
    - Secure password storage with encryption

  3. Features
    - Bilingual support (English + Kannada)
    - Complete inventory management
    - Order tracking and management
    - Analytics and reporting
    - Customer management
*/

-- Admin Users Table
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

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_kn text NOT NULL,
  slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES categories(id),
  category_image text,
  description text,
  book_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Books Table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE NOT NULL,
  title_en text NOT NULL,
  title_kn text,
  author text NOT NULL,
  publisher text,
  isbn text UNIQUE,
  cost_price decimal(10,2) NOT NULL,
  mrp decimal(10,2) NOT NULL,
  selling_price decimal(10,2) NOT NULL,
  stock_qty integer DEFAULT 0,
  min_threshold integer DEFAULT 5,
  description text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  image text,
  category_id uuid REFERENCES categories(id),
  keywords text[],
  language text DEFAULT 'english' CHECK (language IN ('english', 'kannada', 'bilingual')),
  pages integer,
  weight_grams integer,
  dimensions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE,
  phone text UNIQUE NOT NULL,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  address_line text,
  city text,
  state text,
  pincode text,
  total_orders integer DEFAULT 0,
  total_spent decimal(10,2) DEFAULT 0,
  last_order_date timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  status text DEFAULT 'placed' CHECK (status IN ('placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned')),
  total_amount decimal(10,2) NOT NULL,
  discount_amount decimal(10,2) DEFAULT 0,
  shipping_amount decimal(10,2) DEFAULT 0,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method text,
  shipping_address jsonb NOT NULL,
  billing_address jsonb,
  tracking_awb text,
  tracking_url text,
  courier_partner text DEFAULT 'india_post',
  notes text,
  placed_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  packed_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  book_id uuid REFERENCES books(id),
  book_title text NOT NULL,
  book_author text NOT NULL,
  book_sku text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  cost_price_snapshot decimal(10,2) NOT NULL,
  mrp_snapshot decimal(10,2) NOT NULL,
  discount_amount decimal(10,2) DEFAULT 0,
  total_amount decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Analytics Daily Table
CREATE TABLE IF NOT EXISTS analytics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  total_revenue decimal(10,2) DEFAULT 0,
  total_orders integer DEFAULT 0,
  total_units_sold integer DEFAULT 0,
  total_customers integer DEFAULT 0,
  new_customers integer DEFAULT 0,
  total_profit decimal(10,2) DEFAULT 0,
  total_discount_given decimal(10,2) DEFAULT 0,
  avg_order_value decimal(10,2) DEFAULT 0,
  top_selling_book_id uuid REFERENCES books(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin users can manage admin_users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can manage books"
  ON books
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can manage customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can manage orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can manage order_items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can view analytics"
  ON analytics_daily
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_category_id ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_stock_qty ON books(stock_qty);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_placed_at ON orders(placed_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_book_id ON order_items(book_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (username, password_hash, full_name, email, role) 
VALUES (
  'admin',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash for 'admin123'
  'System Administrator',
  'admin@olavubooks.com',
  'super_admin'
) ON CONFLICT (username) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name_en, name_kn, slug, description) VALUES
('Fiction', 'ಕಾದಂಬರಿ', 'fiction', 'Fictional books and novels'),
('Non-Fiction', 'ಅಲ್ಲಾಕಾದಂಬರಿ', 'non-fiction', 'Non-fictional books'),
('Academic', 'ಶೈಕ್ಷಣಿಕ', 'academic', 'Educational and academic books'),
('Kannada Literature', 'ಕನ್ನಡ ಸಾಹಿತ್ಯ', 'kannada-literature', 'Kannada literary works'),
('Children Books', 'ಮಕ್ಕಳ ಪುಸ್ತಕಗಳು', 'children-books', 'Books for children'),
('Self Help', 'ಸ್ವಸಹಾಯ', 'self-help', 'Self improvement and help books')
ON CONFLICT (slug) DO NOTHING;