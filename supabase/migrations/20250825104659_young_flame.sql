/*
  # Update books table for bilingual support

  1. Changes
    - Add author_kn column for Kannada author names
    - Add publisher_kn column for Kannada publisher names  
    - Add description_kn column for Kannada descriptions
    - Update existing data to maintain compatibility

  2. Data Migration
    - Copy existing author to author_en (if needed)
    - Copy existing publisher to publisher_en (if needed)
    - Copy existing description to description_en (if needed)
*/

-- Add new columns for Kannada content
DO $$
BEGIN
  -- Add author_kn column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'books' AND column_name = 'author_kn'
  ) THEN
    ALTER TABLE books ADD COLUMN author_kn text;
  END IF;

  -- Add publisher_kn column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'books' AND column_name = 'publisher_kn'
  ) THEN
    ALTER TABLE books ADD COLUMN publisher_kn text;
  END IF;

  -- Add description_kn column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'books' AND column_name = 'description_kn'
  ) THEN
    ALTER TABLE books ADD COLUMN description_kn text;
  END IF;
END $$;