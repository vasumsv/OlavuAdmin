/*
  # Add Binding Field to Books Table

  1. Changes
    - Add `binding` column to `books` table
      - Type: text (nullable)
      - Values: 'hardbound', 'paperback', or NULL
      - Optional field for specifying book binding type
  
  2. Notes
    - Field is optional (nullable) to maintain backward compatibility
    - No data migration needed as existing records can have NULL values
    - Supports common binding types for bookstores
*/

-- Add binding column to books table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'books' AND column_name = 'binding'
  ) THEN
    ALTER TABLE books ADD COLUMN binding text;
    COMMENT ON COLUMN books.binding IS 'Book binding type (e.g., hardbound, paperback)';
  END IF;
END $$;