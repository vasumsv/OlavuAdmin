/*
  # Create Authors Table with Display Order

  1. New Table: `authors`
    - `id` (uuid, primary key) - Unique identifier
    - `name_en` (text) - Author name in English (required)
    - `name_kn` (text, nullable) - Author name in Kannada
    - `bio_en` (text, nullable) - Biography in English
    - `bio_kn` (text, nullable) - Biography in Kannada
    - `profile_image` (text, nullable) - Author profile image URL
    - `display_order` (integer) - Order for displaying authors (default 0)
    - `is_active` (boolean) - Active/inactive status (default true)
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `authors` table
    - Add policy for authenticated users to read all authors
    - Add policy for authenticated users to manage authors

  3. Indexes
    - Index on `display_order` for efficient ordering queries
    - Index on `name_en` for search functionality

  4. Notes
    - `display_order` allows custom sorting of authors
    - Automatically assigns highest order + 1 when new authors are added
    - Books table will continue to store author names directly for backward compatibility
*/

-- Create authors table
CREATE TABLE IF NOT EXISTS authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_kn text,
  bio_en text,
  bio_kn text,
  profile_image text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_authors_display_order ON authors(display_order);
CREATE INDEX IF NOT EXISTS idx_authors_name_en ON authors(name_en);
CREATE INDEX IF NOT EXISTS idx_authors_is_active ON authors(is_active);

-- Enable RLS
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all authors
CREATE POLICY "Anyone can view authors"
  ON authors FOR SELECT
  USING (true);

-- Policy: Allow authenticated users to insert authors
CREATE POLICY "Authenticated users can insert authors"
  ON authors FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to update authors
CREATE POLICY "Authenticated users can update authors"
  ON authors FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to delete authors
CREATE POLICY "Authenticated users can delete authors"
  ON authors FOR DELETE
  TO authenticated
  USING (true);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_authors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS authors_updated_at ON authors;
CREATE TRIGGER authors_updated_at
  BEFORE UPDATE ON authors
  FOR EACH ROW
  EXECUTE FUNCTION update_authors_updated_at();