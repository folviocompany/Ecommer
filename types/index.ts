export interface Category {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  created_at: string;
}

export interface Variation {
  id: number;
  product_id: number;
  size: string | null;
  color: string | null;
  color_hex: string | null;
  sku: string | null;
  stock: number;
  price_modifier: number;
  active: boolean;
}

export interface VariationPublic {
  id: number;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  stock: number;
  priceModifier: number;
  finalPrice: number;
}

export interface Product {
  id: number;
  category_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  images: string[];
  featured: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductPublic {
  id: number;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: { id: number; name: string; slug: string } | null;
  featured: boolean;
  hasStock: boolean;
}

export interface ProductDetail extends ProductPublic {
  description: string | null;
  variations: VariationPublic[];
  availableSizes: string[];
  availableColors: string[];
}

export interface CartItem {
  productId: number;
  variationId: number;
  productName: string;
  variationDesc: string;
  image: string;
  unitPrice: number;
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variationId: number) => void;
  updateQuantity: (variationId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variation_id: number | null;
  product_name: string;
  variation_desc: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  status: OrderStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_cpf: string | null;
  shipping_address: string | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export type OrderStatus =
  | 'pendente'
  | 'aprovado'
  | 'cancelado'
  | 'em_preparacao'
  | 'enviado'
  | 'entregue';

export interface ShippingAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface CheckoutCustomer {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

export interface CheckoutItem {
  productId: number;
  variationId: number;
  quantity: number;
}
