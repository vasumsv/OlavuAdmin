/*
  # Add automatic combo availability management based on stock levels

  1. Functions
    - `check_and_update_combo_availability()` - Checks stock and updates combo status
    - `get_combo_max_quantity(combo_id)` - Gets maximum available quantity for a combo

  2. Triggers
    - Updates combo availability when book stock changes
    - Automatically disables combos when any book goes out of stock

  3. Features
    - Real-time combo availability updates
    - Prevents overselling of combos
    - Automatic status management
*/

-- Function to get maximum available quantity for a combo based on book stocks
CREATE OR REPLACE FUNCTION get_combo_max_quantity(combo_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
    min_available integer := 999999;
    book_record record;
BEGIN
    -- Get the minimum available quantity across all books in the combo
    FOR book_record IN
        SELECT 
            b.stock_qty,
            gcb.quantity as combo_quantity
        FROM gift_combo_books gcb
        JOIN books b ON b.id = gcb.book_id
        WHERE gcb.combo_id = combo_id_param
          AND b.status = 'active'
    LOOP
        -- Calculate how many combos we can make with this book
        min_available := LEAST(min_available, FLOOR(book_record.stock_qty / book_record.combo_quantity));
    END LOOP;
    
    -- If no books found or any book is out of stock, return 0
    IF min_available = 999999 OR min_available < 0 THEN
        RETURN 0;
    END IF;
    
    RETURN min_available;
END;
$$;

-- Function to check and update combo availability based on stock
CREATE OR REPLACE FUNCTION check_and_update_combo_availability()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    combo_record record;
    max_quantity integer;
BEGIN
    -- Check all combos that include the updated book
    FOR combo_record IN
        SELECT DISTINCT gc.id, gc.is_active
        FROM gift_combos gc
        JOIN gift_combo_books gcb ON gc.id = gcb.combo_id
        WHERE gcb.book_id = NEW.id OR gcb.book_id = OLD.id
    LOOP
        -- Get maximum available quantity for this combo
        max_quantity := get_combo_max_quantity(combo_record.id);
        
        -- Update combo availability based on stock
        IF max_quantity <= 0 AND combo_record.is_active = true THEN
            -- Disable combo if no stock available
            UPDATE gift_combos 
            SET is_active = false, 
                updated_at = now()
            WHERE id = combo_record.id;
        ELSIF max_quantity > 0 AND combo_record.is_active = false THEN
            -- Re-enable combo if stock becomes available (optional - you might want manual control)
            -- Uncomment the next 4 lines if you want automatic re-enabling
            -- UPDATE gift_combos 
            -- SET is_active = true, 
            --     updated_at = now()
            -- WHERE id = combo_record.id;
        END IF;
    END LOOP;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to automatically update combo availability when book stock changes
CREATE OR REPLACE TRIGGER update_combo_availability_on_stock_change
    AFTER UPDATE OF stock_qty, status ON books
    FOR EACH ROW
    EXECUTE FUNCTION check_and_update_combo_availability();

-- Trigger to update combo availability when books are inserted/deleted
CREATE OR REPLACE TRIGGER update_combo_availability_on_book_change
    AFTER INSERT OR DELETE ON books
    FOR EACH ROW
    EXECUTE FUNCTION check_and_update_combo_availability();