/*
  # Add image2 column to books table

  1. Changes
    - Add `image2` column to `books` table for storing second product image URL
    - Column is optional (nullable) and stores text URLs
*/

-- Add image2 column to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS image2 text;

-- Add index for image2 column for better performance when filtering by image presence
CREATE INDEX IF NOT EXISTS idx_books_image2 ON books (image2) WHERE image2 IS NOT NULL;