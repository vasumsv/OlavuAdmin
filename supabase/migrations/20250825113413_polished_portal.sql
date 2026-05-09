/*
  # Add category URL field to categories table

  1. New Column
    - `category_url` (text, nullable)
      - Stores the URL/link for the category
      - Can be used for external links or category-specific pages

  2. Index
    - Add index on category_url for better query performance

  This migration adds a new field to store category URLs while maintaining backward compatibility.
*/

-- Add category_url column to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS category_url text;

-- Add index for better performance on category_url queries
CREATE INDEX IF NOT EXISTS idx_categories_url 
ON categories (category_url);

-- Add comment for documentation
COMMENT ON COLUMN categories.category_url IS 'URL/link associated with the category';