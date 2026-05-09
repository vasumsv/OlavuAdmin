/*
  # Delete all products data

  This migration removes all product data from the books table while preserving
  the table structure and related data integrity.

  ## What gets deleted:
  - All records from the books table
  
  ## What gets preserved:
  - Table structure remains intact
  - Categories table unaffected
  - Other tables unaffected
  
  ## Safety:
  - Only deletes from books table
  - Preserves all table schemas
  - Includes logging for confirmation
*/

-- Log start of deletion
DO $$ BEGIN
  RAISE NOTICE 'Starting deletion of all products data...';
END $$;

-- Delete all products from books table
DELETE FROM books;

-- Log completion
DO $$ BEGIN
  RAISE NOTICE 'All products data deleted successfully from books table';
  RAISE NOTICE 'Table structure preserved';
END $$;