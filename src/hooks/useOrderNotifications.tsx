import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface OrderNotification {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
}

export const useOrderNotifications = (enabled: boolean) => {
  const [notification, setNotification] = useState<OrderNotification | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Initialize with the latest order ID to avoid showing old orders on mount
    const initializeLastOrder = async () => {
      const { data } = await supabase
        .from('orders')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setLastOrderId(data.id);
      }
    };

    initializeLastOrder();

    // Subscribe to new orders
    const channel = supabase
      .channel('order-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          const newOrder = payload.new as any;

          // Only show notification if this is a new order (not the initialization)
          if (lastOrderId && newOrder.id !== lastOrderId) {
            setNotification({
              id: newOrder.id,
              order_number: newOrder.order_number,
              customer_name: newOrder.customer_name,
              total_amount: newOrder.total_amount
            });

            // Update last order ID
            setLastOrderId(newOrder.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, lastOrderId]);

  const clearNotification = () => {
    setNotification(null);
  };

  return { notification, clearNotification };
};
