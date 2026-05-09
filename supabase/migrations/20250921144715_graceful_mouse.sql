/*
  # Add images JSON column to books table

  1. New Column
    - `images` (jsonb array) - stores all product image URLs as JSON array
  
  2. Data Migration
    - Migrate existing `image` and `image2` data to new `images` JSON array
    - Preserve existing data during transition
  
  3. Performance
    - Add GIN index for efficient JSON operations
  
  4. Backward Compatibility
    - Keep existing `image` and `image2` columns for now
    - Can be removed in future migration after full transition
*/

-- Add the new images column as JSONB array
ALTER TABLE books ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;

-- Migrate existing image data to the new JSON column
UPDATE books 
SET images = (
  SELECT jsonb_agg(img_url)
  FROM (
    SELECT unnest(
      ARRAY[image, image2]
    ) AS img_url
    WHERE img_url IS NOT NULL AND img_url != ''
  ) AS img_urls
)
WHERE (image IS NOT NULL AND image != '') OR (image2 IS NOT NULL AND image2 != '');

-- Add GIN index for efficient JSON operations
CREATE INDEX IF NOT EXISTS idx_books_images_gin ON books USING gin (images);

-- Add comment for documentation
COMMENT ON COLUMN books.images IS 'JSON array storing all product image URLs (up to 5 images)';