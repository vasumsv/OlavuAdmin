export interface Book {
  id: string;
  sku: string;
  title_en: string;
  title_kn?: string;
  title_spelling_tags_en?: string[];
  title_spelling_tags_kn?: string[];
  author: string;
  author_kn?: string;
  author_profile_image?: string;
  author_spelling_tags_en?: string[];
  author_spelling_tags_kn?: string[];
  publisher?: string;
  publisher_kn?: string;
  isbn?: string;
  cost_price: number;
  mrp: number;
  selling_price: number;
  stock_qty: number;
  min_threshold: number;
  description?: string;
  description_kn?: string;
  status: 'active' | 'inactive';
  image?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image5?: string;
  category_id: string;
  keywords?: string[];
  language?: 'english' | 'kannada' | 'bilingual';
  pages?: number;
  weight_grams?: number;
  dimensions?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name_en: string;
  name_kn: string;
  slug: string;
  parent_id?: string;
  category_image: string;
  description: string;
  description_kn?: string;
  book_count: number;
}

export interface CartItem {
  id: string;
  book: Book;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'placed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  placed_at: string; // Full timestamp with date and time
  items: OrderItem[];
  shipping_address: Address;
  tracking?: TrackingInfo;
}

export interface OrderItem {
  id: string;
  product_id: string;
  book: Book;
  qty: number;
  unit_price: number;
  cost_price_snapshot: number;
  mrp_snapshot: number;
}

export interface Address {
  name: string;
  phone: string;
  email?: string;
  pincode: string;
  city: string;
  state: string;
  address_line: string;
}

export interface TrackingInfo {
  courier: string;
  awb: string;
  tracking_url: string;
  status: string;
  shipped_at?: string;
  delivered_at?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
}

export interface Analytics {
  revenue: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  units_sold: number;
  profit: number;
  profit_margin: number;
  discount_given: {
    amount: number;
    percentage: number;
  };
  top_sellers: Book[];
  low_stock_alerts: Book[];
}