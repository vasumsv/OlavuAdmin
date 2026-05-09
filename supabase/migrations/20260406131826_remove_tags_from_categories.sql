/*
  # Remove Tags from Categories

  1. Purpose
    - Remove tags field from categories table
    - Tags will only be managed at product (books) level
    - Keep tags in books table intact

  2. Changes
    - Drop tags column from categories table
    - Books table tags remain unchanged

  3. Notes
    - This migration only removes category-level tags
    - Product-level tags are preserved and functional
*/

-- Remove tags from categories table
ALTER TABLE categories DROP COLUMN IF EXISTS tags;