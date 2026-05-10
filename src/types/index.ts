/* ============================================
   GRAPHITE GALLERY — TYPE DEFINITIONS
   ============================================ */

// --- Auth & User ---
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  created_at: string;
  updated_at: string;
}

// --- Products ---
export interface Product {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  price: number;
  image_url: string;
  hover_images: string[];
  github_filename: string;
  is_pinned: boolean;
  sort_order: number;
}

export interface GalleryCategory {
  id: string;
  title: string;
  path: string;
  image: string;
  description: string;
}

export interface ParsedFileName {
  idPart: string;
  isHover: boolean;
  hoverNum: number;
  pinned: boolean;
  num: number;
  price: string;
  priceNum: number;
  title: string;
  subtitle: string;
}

export interface GalleryProduct {
  path: string;
  price: string;
  priceNum: number;
  title: string;
  subtitle: string;
  hovers: string[];
  category: string;
}

// --- Cart ---
export interface CartItem {
  id: string;
  user_id: string;
  product_title: string;
  product_image: string;
  product_price: number;
  product_category: string;
  quantity: number;
  custom_text: string | null;
  created_at: string;
}

// --- Wishlist ---
export interface WishlistItem {
  id: string;
  user_id: string;
  product_title: string;
  product_image: string;
  product_price: number;
  product_category: string;
  created_at: string;
}

// --- Orders ---
export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  total_amount: number;
  advance_paid: number;
  payment_id: string | null;
  payment_method: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_title: string;
  product_image: string;
  product_price: number;
  product_category: string;
  quantity: number;
  custom_text: string | null;
}

// --- Reviews ---
export interface Review {
  id: string;
  user_id: string;
  product_category: string;
  rating: number;
  comment: string;
  user_name: string;
  created_at: string;
}

// --- Contact ---
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  order_text: string;
  message: string;
  original_price: number;
  advance_amount: number;
  payment_id: string | null;
  status: 'new' | 'read' | 'responded';
  user_id: string | null;
  created_at: string;
}

// --- Activity ---
export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  details: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// --- Toast ---
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}
