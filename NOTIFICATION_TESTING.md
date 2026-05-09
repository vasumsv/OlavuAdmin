# Order Notification System - Testing Guide

## Overview
The order notification system displays a real-time popup notification at the top-left corner when a new order is created, provided notifications are enabled in settings.

## Features Implemented

### 1. Settings Tab (Notifications)
- **Location**: Settings > Notifications tab
- **Features**:
  - Order Notifications toggle (enables/disables new order alerts)
  - Low Stock Alerts toggle (for future implementation)
  - Daily Reports toggle (for future implementation)
  - All settings are saved to database and localStorage
  - Visual feedback when settings are changed

### 2. Real-Time Order Notifications
- **Location**: Top-left corner of the screen
- **Trigger**: When a new order is inserted into the `orders` table
- **Content**: Shows order number, customer name, and total amount
- **Duration**: Auto-closes after 8 seconds
- **Visual**: Blue notification toast with shopping cart icon

### 3. Notification Indicator
- **Location**: Top-right bell icon in admin header
- **Visual**: Green dot appears when notifications are enabled
- **Interactive**: Hover to see status

## How to Test

### Step 1: Enable Notifications
1. Login to admin panel (username: `admin`, password: `admin123`)
2. Navigate to **Settings** page
3. Click on **Notifications** tab
4. Ensure **Order Notifications** is checked (enabled)
5. You should see a success message confirming the settings were saved

### Step 2: Verify Notification Status
1. Look at the bell icon in the top-right header
2. You should see a small green dot on the bell icon indicating notifications are active

### Step 3: Create a Test Order (Method 1 - SQL)
Run this SQL query in your Supabase SQL Editor:

```sql
INSERT INTO orders (
  order_number,
  customer_name,
  customer_phone,
  customer_email,
  shipping_address,
  city,
  state,
  pincode,
  payment_method,
  payment_status,
  status,
  subtotal,
  shipping_cost,
  discount_amount,
  total_amount
) VALUES (
  'ORD-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
  'Test Customer',
  '9876543210',
  'test@example.com',
  '123 Test Street, Test Area',
  'Bangalore',
  'Karnataka',
  '560001',
  'COD',
  'pending',
  'placed',
  500.00,
  50.00,
  0.00,
  550.00
);
```

### Step 4: Observe the Notification
- A blue notification should appear at the **top-left corner**
- It should display: "New order #ORD-XXXX from Test Customer - ₹550"
- The notification will auto-close after 8 seconds
- You can manually close it by clicking the X button

### Step 5: Test Disabling Notifications
1. Go back to **Settings > Notifications**
2. Uncheck **Order Notifications**
3. Observe the green dot on the bell icon disappears
4. Create another test order using the SQL above
5. No notification should appear

## Technical Details

### Database Table
- **Table**: `user_preferences`
- **Columns**:
  - `user_id`: Links to admin user
  - `order_notifications`: Boolean flag
  - `low_stock_alerts`: Boolean flag (not yet implemented)
  - `daily_reports`: Boolean flag (not yet implemented)

### Real-Time Subscription
- Uses Supabase Realtime to listen for INSERT events on the `orders` table
- Automatically initializes with the latest order to prevent showing old orders on page load
- Only shows notifications for NEW orders created after the admin logs in

### Components
- **NotificationToast**: Reusable toast component with auto-close
- **useOrderNotifications**: Custom hook for order monitoring
- **AdminLayout**: Integrates notifications across all admin pages

## Troubleshooting

### Notification Not Appearing
1. Check if notifications are enabled in Settings
2. Verify the green dot appears on the bell icon
3. Check browser console for any errors
4. Ensure Supabase Realtime is enabled for your project

### Notification Shows Old Orders
- This shouldn't happen - the system tracks the last order ID to prevent showing historical orders
- Try refreshing the page to reset the tracking

### Settings Not Saving
1. Check browser console for errors
2. Verify RLS policies are correctly set on `user_preferences` table
3. Ensure you're logged in as an admin user

## Future Enhancements
- Low stock alert notifications
- Daily report email notifications
- Sound notifications option
- Custom notification duration settings
- Notification history/log
