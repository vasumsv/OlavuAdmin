/*
  # Add support for multiple product images

  1. New Columns
    - Add `image3`, `image4`, `image5` columns to books table for additional images
    - All new columns are optional (nullable)

  2. Indexes
    - Add indexes for the new image columns for better performance

  3. Migration
    - Safely adds new columns without affecting existing data
    - Maintains backward compatibility with existing image and image2 columns
*/

-- Add additional image columns to books table
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS image3 text,
ADD COLUMN IF NOT EXISTS image4 text,
ADD COLUMN IF NOT EXISTS image5 text;

-- Add indexes for the new image columns
CREATE INDEX IF NOT EXISTS idx_books_image3 ON books (image3) WHERE image3 IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_books_image4 ON books (image4) WHERE image4 IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_books_image5 ON books (image5) WHERE image5 IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN books.image3 IS 'Third product image URL';
COMMENT ON COLUMN books.image4 IS 'Fourth product image URL';
COMMENT ON COLUMN books.image5 IS 'Fifth product image URL';