/*
  # Add spelling mistake tags for better search functionality

  1. New Columns Added
    - `title_spelling_tags_en` (text array) - English spelling variations for book titles
    - `title_spelling_tags_kn` (text array) - Kannada spelling variations for book titles  
    - `author_spelling_tags_en` (text array) - English spelling variations for author names
    - `author_spelling_tags_kn` (text array) - Kannada spelling variations for author names

  2. Purpose
    - Help users find books even with spelling mistakes
    - Support both English and Kannada spelling variations
    - Maximum 10 tags per field for performance
    - All fields are optional

  3. Usage Examples
    - Book: "The Alchemist" → tags: ["Allchemist", "Alchimist", "Alkemist"]
    - Author: "Paulo Coelho" → tags: ["Paolo Coelho", "Paulo Coelo", "Paul Coelho"]
*/

-- Add spelling mistake tags columns to books table
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS title_spelling_tags_en text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS title_spelling_tags_kn text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS author_spelling_tags_en text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS author_spelling_tags_kn text[] DEFAULT '{}';

-- Add indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_books_title_spelling_tags_en ON books USING GIN (title_spelling_tags_en);
CREATE INDEX IF NOT EXISTS idx_books_title_spelling_tags_kn ON books USING GIN (title_spelling_tags_kn);
CREATE INDEX IF NOT EXISTS idx_books_author_spelling_tags_en ON books USING GIN (author_spelling_tags_en);
CREATE INDEX IF NOT EXISTS idx_books_author_spelling_tags_kn ON books USING GIN (author_spelling_tags_kn);

-- Add comments for documentation
COMMENT ON COLUMN books.title_spelling_tags_en IS 'English spelling variations/mistakes for book title (max 10 tags)';
COMMENT ON COLUMN books.title_spelling_tags_kn IS 'Kannada spelling variations/mistakes for book title (max 10 tags)';
COMMENT ON COLUMN books.author_spelling_tags_en IS 'English spelling variations/mistakes for author name (max 10 tags)';
COMMENT ON COLUMN books.author_spelling_tags_kn IS 'Kannada spelling variations/mistakes for author name (max 10 tags)';