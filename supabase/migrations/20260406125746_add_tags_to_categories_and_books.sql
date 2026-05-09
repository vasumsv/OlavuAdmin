/*
  # Add Tags Support to Categories and Books

  1. Changes
    - Add `tags` column to `categories` table
      - Type: text[] (PostgreSQL array of text)
      - Nullable: true (backward compatibility)
      - Default: empty array
    
    - Add `tags` column to `books` table
      - Type: text[] (PostgreSQL array of text)
      - Nullable: true (backward compatibility)
      - Default: empty array

  2. Notes
    - Uses PostgreSQL native array type for better performance
    - Maintains backward compatibility by allowing null values
    - No data migration needed as existing records will have null/empty arrays
*/

-- Add tags column to categories table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'tags'
  ) THEN
    ALTER TABLE categories ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
END $$;

-- Add tags column to books table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'books' AND column_name = 'tags'
  ) THEN
    ALTER TABLE books ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
END $$;