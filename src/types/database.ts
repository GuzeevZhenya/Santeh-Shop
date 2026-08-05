export type UserRole = 'admin' | 'user';
export type OrderStatus = 'new' | 'processing' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'card';
export type DeliveryMethod = 'delivery' | 'pickup';
export type CallbackStatus = 'new' | 'done';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  category_id: string | null;
  price: number;
  old_price: number | null;
  description: string | null;
  image_url: string | null;
  brand: string | null;
  specs: string | null;
  rating: number;
  is_deal_of_day: boolean;
  in_carousel: boolean;
  is_active: boolean;
  gallery: string[];
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  qty: number;
  image_url?: string | null;
}

export interface Order {
  id: string;
  order_number: string | null;
  customer_name: string;
  phone: string;
  address: string | null;
  comment: string | null;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  admin_comment: string | null;
  customer_user_id: string | null;
  customer_email: string | null;
  payment_method: PaymentMethod;
  delivery_method: DeliveryMethod;
  delivery_cost: number;
  consent_at?: string | null;
  policy_version?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  author_name: string | null;
  author_id: string | null;
  rating: number;
  text: string | null;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface Testimonial {
  id: string;
  author_name: string;
  rating: number;
  text: string;
  approved: boolean;
  created_at: string;
}

export interface Callback {
  id: string;
  name: string | null;
  phone: string;
  purpose: string | null;
  status: CallbackStatus;
  consent_at?: string | null;
  policy_version?: string | null;
  created_at: string;
}

export interface ConsentLog {
  id: string;
  created_at: string;
  source: 'checkout' | 'callback' | 'register' | 'review' | 'testimonial' | 'cookie';
  policy_version: string;
  user_id: string | null;
  email: string | null;
  phone: string | null;
  meta: Record<string, unknown>;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  badge: string | null;
  product_id: string | null;
  category_id: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface CalendarNote {
  id: string;
  note_date: string;
  note: string;
  remind_days: number;
  done: boolean;
  order_number: string | null;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  hours: string | null;
  announcement: string | null;
  legal_name?: string | null;
  unp?: string | null;
  legal_address?: string | null;
  privacy_version?: string | null;
}

export interface CartItem {
  key: string;
  id: string;
  name: string;
  price: number;
  qty: number;
  image_url?: string | null;
  variant?: string;
}
