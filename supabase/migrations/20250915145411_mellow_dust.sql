/*
  # Remove RLS policies from gift combos tables

  1. Security Changes
    - Disable RLS on gift_combos table
    - Disable RLS on gift_combo_books table
    - Remove all existing RLS policies from both tables

  This allows unrestricted access to gift combos functionality for admin operations.
*/

-- Disable RLS on gift_combos table
ALTER TABLE gift_combos DISABLE ROW LEVEL SECURITY;

-- Disable RLS on gift_combo_books table  
ALTER TABLE gift_combo_books DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on gift_combos table
DROP POLICY IF EXISTS "Allow authenticated users to manage gift combos" ON gift_combos;
DROP POLICY IF EXISTS "Allow public to read active gift combos" ON gift_combos;

-- Drop all existing policies on gift_combo_books table
DROP POLICY IF EXISTS "Allow authenticated users to manage gift combo books" ON gift_combo_books;
DROP POLICY IF EXISTS "Allow public to read gift combo books" ON gift_combo_books;