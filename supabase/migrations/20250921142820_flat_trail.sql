/*
  # Convert image storage to JSON format

  1. Changes
    - Add new `images` column as JSONB array
    - Migrate existing image and image2 data to JSON format
    - Add index for JSON operations
    - Keep old columns for backward compatibility during transition

  2. Security
    - No RLS changes needed as this inherits from books table
*/

-- Add new images column as JSONB array
ALTER TABLE books ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Create index for JSON operations
CREATE INDEX IF NOT EXISTS idx_books_images ON books USING gin (images);

-- Migrate existing image data to JSON format
UPDATE books 
SET images = (
  SELECT jsonb_agg(img_url)
  FROM (
    SELECT unnest(
      ARRAY[image, image2]::text[]
    ) AS img_url
    WHERE img_url IS NOT NULL AND img_url != ''
  ) AS img_urls
)
WHERE (image IS NOT NULL AND image != '') OR (image2 IS NOT NULL AND image2 != '');

-- Set empty array for records with no images
UPDATE books 
SET images = '[]'::jsonb 
WHERE images IS NULL;