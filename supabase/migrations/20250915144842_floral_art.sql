/*
  # Create Gift Combos System

  1. New Tables
    - `gift_combos`
      - `id` (uuid, primary key)
      - `name` (text, combo name)
      - `description` (text, combo description)
      - `price` (numeric, combo price)
      - `images` (text[], array of image URLs)
      - `is_active` (boolean, availability status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `gift_combo_books`
      - `id` (uuid, primary key)
      - `combo_id` (uuid, foreign key to gift_combos)
      - `book_id` (uuid, foreign key to books)
      - `quantity` (integer, number of this book in combo)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage combos
    - Add policies for public to read active combos

  3. Functions
    - Trigger to update book stock when combo is sold
    - Function to check combo availability based on book stock
*/

-- Create gift_combos table
CREATE TABLE IF NOT EXISTS gift_combos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  images text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gift_combo_books junction table
CREATE TABLE IF NOT EXISTS gift_combo_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  combo_id uuid NOT NULL REFERENCES gift_combos(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(combo_id, book_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gift_combos_active ON gift_combos(is_active);
CREATE INDEX IF NOT EXISTS idx_gift_combos_name ON gift_combos(name);
CREATE INDEX IF NOT EXISTS idx_gift_combo_books_combo_id ON gift_combo_books(combo_id);
CREATE INDEX IF NOT EXISTS idx_gift_combo_books_book_id ON gift_combo_books(book_id);

-- Enable RLS
ALTER TABLE gift_combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_combo_books ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gift_combos
CREATE POLICY "Allow public to read active gift combos"
  ON gift_combos
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Allow authenticated users to manage gift combos"
  ON gift_combos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for gift_combo_books
CREATE POLICY "Allow public to read gift combo books"
  ON gift_combo_books
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to manage gift combo books"
  ON gift_combo_books
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to update book stock when combo is sold
CREATE OR REPLACE FUNCTION update_book_stock_for_combo_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- Update stock for each book in the combo
  UPDATE books 
  SET stock_qty = stock_qty - (gcb.quantity * NEW.quantity)
  FROM gift_combo_books gcb
  WHERE gcb.combo_id = NEW.combo_id 
    AND books.id = gcb.book_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if combo is available based on book stock
CREATE OR REPLACE FUNCTION check_combo_availability(combo_id_param uuid)
RETURNS boolean AS $$
DECLARE
  min_available integer;
BEGIN
  -- Find the minimum available quantity across all books in the combo
  SELECT MIN(FLOOR(b.stock_qty / gcb.quantity))
  INTO min_available
  FROM gift_combo_books gcb
  JOIN books b ON b.id = gcb.book_id
  WHERE gcb.combo_id = combo_id_param
    AND b.status = 'active';
  
  -- Return true if at least 1 combo can be made
  RETURN COALESCE(min_available, 0) > 0;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger for gift_combos
CREATE TRIGGER update_gift_combos_updated_at
  BEFORE UPDATE ON gift_combos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();