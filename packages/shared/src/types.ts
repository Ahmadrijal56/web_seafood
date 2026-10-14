export type StockStatus = "available" | "limited" | "out";
export type ProductType = "fresh" | "frozen";
export type Badge = "today_catch" | "best_seller" | "promo" | "limited";
export type OptionKind = "weight" | "processing";
export type OrderStatus = "new" | "confirmed" | "shipped" | "done" | "cancelled";
export type DeliveryMethod = "delivery" | "pickup";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  path: string | null;
  sort_order: number;
}

export interface PriceTier {
  id: string;
  product_id: string;
  min_kg: number;
  price_per_kg: number;
}

export interface ProductOption {
  id: string;
  product_id: string;
  kind: OptionKind;
  label: string;
  value: number | null;
  extra_price: number;
  sort_order: number;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  type: ProductType;
  size_label: string | null;
  short_description: string | null;
  description: string | null;
  cooking_tips: string | null;
  show_price: boolean;
  price_per_kg: number | null;
  compare_price: number | null;
  min_order_kg: number;
  stock_status: StockStatus;
  badges: Badge[];
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  sold_count: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductWithRelations extends Product {
  category?: Pick<Category, "id" | "name" | "slug"> | null;
  product_images?: ProductImage[];
  price_tiers?: PriceTier[];
  product_options?: ProductOption[];
}

export interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  price: number;
  compare_price: number | null;
  is_active: boolean;
  sort_order: number;
}

export interface BundleItem {
  bundle_id: string;
  product_id: string;
  qty_kg: number;
}

export interface BundleWithItems extends Bundle {
  bundle_items?: (BundleItem & { product?: Pick<Product, "id" | "name" | "slug" | "size_label"> | null })[];
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link: string | null;
  cta_label: string | null;
  starts_at: string | null;
  ends_at: string | null;
  show_countdown: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  city: string | null;
  rating: number;
  content: string;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Video {
  id: string;
  platform: "youtube" | "tiktok" | "instagram";
  url: string;
  title: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
  sort_order: number;
}

export interface ShippingArea {
  id: string;
  name: string;
  fee: number;
  min_free_shipping: number | null;
  eta: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Order {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  method: DeliveryMethod;
  address: string | null;
  area_id: string | null;
  area_name: string | null;
  delivery_date: string | null;
  notes: string | null;
  subtotal: number;
  shipping_fee: number;
  total: number;
  has_unpriced: boolean;
  status: OrderStatus;
  source: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  bundle_id: string | null;
  name_snapshot: string;
  qty_kg: number;
  processing: string | null;
  notes: string | null;
  unit_price: number | null;
  extra_price: number;
  line_total: number | null;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

/** Hasil fungsi `place_order` di database. */
export interface PlacedOrder {
  order_code: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  has_unpriced: boolean;
  area_name: string | null;
  items: {
    name: string;
    kind: "product" | "bundle";
    qty: number;
    processing?: string | null;
    unit_price: number | null;
    extra_price?: number;
    line_total: number | null;
    notes?: string | null;
  }[];
}
