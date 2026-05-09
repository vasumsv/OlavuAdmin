/*
  # Populate Authors Table from Books

  1. Purpose
    - Extract unique authors from books table
    - Populate the authors table with existing author data
    - Assign sequential display_order based on alphabetical order

  2. Process
    - Get distinct author names from books table
    - Insert into authors table with auto-incremented display_order
    - Handle duplicates gracefully (skip if already exists)

  3. Notes
    - This is a one-time migration to seed initial data
    - Future authors will be managed through the Authors admin page
    - Duplicate author names (e.g., "Shivarama karantha" vs "Shivarama Karantha") are kept as-is
*/

-- Insert unique authors from books table into authors table
INSERT INTO authors (name_en, name_kn, display_order, is_active)
SELECT DISTINCT 
  TRIM(author) as name_en,
  TRIM(author_kn) as name_kn,
  ROW_NUMBER() OVER (ORDER BY TRIM(author)) - 1 as display_order,
  true as is_active
FROM books
WHERE author IS NOT NULL 
  AND TRIM(author) != ''
  AND NOT EXISTS (
    SELECT 1 FROM authors WHERE name_en = TRIM(books.author)
  )
ORDER BY TRIM(author);