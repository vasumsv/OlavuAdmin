/*
  # Add Kannada description field to categories

  1. New Column
    - `description_kn` (text, nullable) - Description in Kannada language
  
  2. Performance
    - Add index on description_kn for better search performance
  
  3. Documentation
    - Add column comment for clarity
*/

-- Add description_kn column to categories table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'description_kn'
  ) THEN
    ALTER TABLE categories ADD COLUMN description_kn text;
    COMMENT ON COLUMN categories.description_kn IS 'Category description in Kannada';
  END IF;
END $$;

-- Add index for better performance on Kannada description searches
CREATE INDEX IF NOT EXISTS idx_categories_description_kn ON categories(description_kn);