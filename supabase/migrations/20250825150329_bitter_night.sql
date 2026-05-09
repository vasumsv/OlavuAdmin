/*
  # Remove category URL field

  1. Changes
    - Remove `category_url` column from categories table
    - Drop the associated index

  2. Security
    - No security changes needed as we're removing a field
*/

-- Drop the index first
DROP INDEX IF EXISTS idx_categories_url;

-- Remove the category_url column
ALTER TABLE categories DROP COLUMN IF EXISTS category_url;