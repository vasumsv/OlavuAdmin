/*
  # Add author profile image URL to books table

  1. New Column
    - `author_profile_image` (text, nullable) - URL for author's profile image
  
  2. Index
    - Add index for better query performance on author profile images
*/

-- Add author profile image URL column
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS author_profile_image text;

-- Add index for author profile image queries
CREATE INDEX IF NOT EXISTS idx_books_author_profile_image 
ON books (author_profile_image) 
WHERE author_profile_image IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN books.author_profile_image IS 'URL for author profile image';