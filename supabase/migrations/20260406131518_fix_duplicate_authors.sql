/*
  # Fix Duplicate Authors

  1. Purpose
    - Remove duplicate author entries
    - Keep only one entry per unique author name
    - Reassign proper sequential display_order

  2. Process
    - Delete all authors from previous migration
    - Re-insert with proper DISTINCT handling
    - Ensure no duplicates

  3. Notes
    - Cleans up the authors table completely
    - Re-populates with unique authors only
*/

-- Clear existing authors
DELETE FROM authors;

-- Insert unique authors from books table (properly handling duplicates)
WITH unique_authors AS (
  SELECT DISTINCT ON (TRIM(LOWER(author)))
    TRIM(author) as name_en,
    TRIM(author_kn) as name_kn
  FROM books
  WHERE author IS NOT NULL 
    AND TRIM(author) != ''
  ORDER BY TRIM(LOWER(author)), author_kn
)
INSERT INTO authors (name_en, name_kn, display_order, is_active)
SELECT 
  name_en,
  name_kn,
  ROW_NUMBER() OVER (ORDER BY name_en) - 1 as display_order,
  true as is_active
FROM unique_authors
ORDER BY name_en;