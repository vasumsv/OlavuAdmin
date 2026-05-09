/*
  # Delete all data from all tables

  This migration removes all data from every table in the database while preserving
  all table structures, constraints, indexes, and other schema elements.
  
  ## Tables affected:
  - order_items (deleted first due to foreign keys)
  - orders 
  - customers
  - books
  - categories
  - admin_users
  - reviews
  - analytics_daily
  - addresses
  - otp_sessions
  - gift_combos
  - gift_combo_books
  - coupons
  - All other tables in the database
  
  ## What is preserved:
  - Table structures
  - Indexes
  - Constraints
  - Triggers
  - Functions
  - Policies
  - All schema elements
*/

-- Log start of deletion
DO $$ BEGIN
  RAISE NOTICE 'Starting deletion of all data from all tables...';
END $$;

-- Delete data in order of foreign key dependencies (children first, then parents)

-- Delete order items first (references orders and books)
DELETE FROM order_items;
DO $$ BEGIN
  RAISE NOTICE 'Deleted all data from order_items table';
END $$;

-- Delete gift combo books (references gift_combos and books)
DELETE FROM gift_combo_books;
DO $$ BEGIN
  RAISE NOTICE 'Deleted all data from gift_combo_books table';
END $$;

-- Delete reviews (references customers, books, orders)
DELETE FROM reviews;
DO $$ BEGIN
  RAISE NOTICE 'Deleted all data from reviews table';
END $$;

-- Delete orders (references customers)
DELETE FROM orders;
DO $$ BEGIN
  RAISE NOTICE 'Deleted all data from orders table';
END $$;

-- Delete addresses (no foreign key dependencies from other tables)
DELETE FROM addresses;
DO $$ BEGIN
  RAISE NOTICE 'Deleted all data from addresses table';
END $$;

-- Delete OTP sessions (no foreign key dependencies from other tables)
DELETE FROM otp_sessions;
DO $$ BEGIN
  RAISE NOTICE 'Deleted all data from otp_sessions table';
END $$;

-- Delete books (references categories)
DELETE FROM books;
DO $$ BEGIN
  RAISE NOTICE 'Deleted all data from books table';
END $$;

-- Delete analytics daily (references books)
DELETE FROM analytics_daily;
DO $$ BEGIN
  RAISE NOTICE 'Deleted all data from analytics_daily table';
END $$;

-- Delete gift combos (no foreign key dependencies from other tables)
DELETE FROM gift_combos;
DO $$ BEGIN
  RAISE NOTICE 'Deleted all data from gift_combos table';
END $$;

-- Delete customers (no foreign key dependencies from other tables)
DELETE FROM customers;
DO $$ BEGIN
  RAISE NOTICE 'Deleted all data from customers table';
END $$;

-- Delete categories (self-referencing, but can be deleted)
DELETE FROM categories;
DO $$ BEGIN
  RAISE NOTICE 'Deleted all data from categories table';
END $$;

-- Delete coupons (no foreign key dependencies from other tables)
DELETE FROM coupons;
DO $$ BEGIN
  RAISE NOTICE 'Deleted all data from coupons table';
END $$;

-- Delete admin users (no foreign key dependencies from other tables)
DELETE FROM admin_users;
DO $$ BEGIN
  RAISE NOTICE 'Deleted all data from admin_users table';
END $$;

-- Delete from any remaining tables that might exist
DELETE FROM flower_catalog;
DELETE FROM coast_data;
DELETE FROM precious_fields;
DELETE FROM ocean_temperatures;
DELETE FROM weather_data;
DELETE FROM truth_records;
DELETE FROM desert_ecosystem;
DELETE FROM lunar_phases;
DELETE FROM dental_records;
DELETE FROM dawn_observations;
DELETE FROM surf_conditions;
DELETE FROM example_table;
DELETE FROM animal_sightings;

DO $$ BEGIN
  RAISE NOTICE 'Deleted all data from remaining tables';
END $$;

-- Log completion
DO $$ BEGIN
  RAISE NOTICE 'All data deleted successfully from all tables';
  RAISE NOTICE 'All table structures, indexes, constraints, and schema elements preserved';
  RAISE NOTICE 'Database is now empty but ready for fresh data';
END $$;