export interface ProductVariant {
  size: string;
  color: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  promoPrice?: number;
  category: string;
  categoryId: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  stockTracked?: boolean;
  variants: ProductVariant[];
  sku: string;
  status: 'ativo' | 'inativo' | 'rascunho';
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  showInHeader?: boolean;
  imageUrl?: string;
  description?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  imageUrl: string;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  link: string;
  linkText: string;
  position: 'hero' | 'secondary' | 'promo';
  order: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId?: string;
  productName?: string;
  authorName: string;
  rating: number; // 1-5
  comment: string;
  isApproved: boolean;
  isDemo: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl: string;
  productUrl: string;
}

export interface OrderIntent {
  id: string;
  customerName: string;
  customerPhone: string;
  customerCity?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: 'pendente' | 'em_atendimento' | 'concluido' | 'cancelado';
  whatsappUrl?: string;
  notes?: string;
  createdAt: string;
}

export type ThemePreset = 'rose-boutique' | 'minimalista-elegante' | 'dark-fashion' | 'pink-glamour' | 'custom';

export interface ThemeColors {
  bg: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textMuted: string;
  border: string;
  buttonBg: string;
  buttonText: string;
  fontHeading: string;
  fontBody: string;
  cardRadius: string;
  buttonRadius: string;
  cardStyle: 'soft' | 'border' | 'shadow';
}

export interface HomepageSection {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  title?: string;
  subtitle?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  logoUrl: string;
  whatsappNumber: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  announcementBar: string;
  announcementActive: boolean;
  freeShippingThreshold: number;
  activeTheme: ThemePreset;
  themeSettings: ThemeColors;
  homepageSections: HomepageSection[];
  pixKey?: string;
  bankInfo?: string;
}

export interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  reviews: Review[];
  orders: OrderIntent[];
  settings: StoreSettings;
  admin: {
    username: string;
    passwordHash: string;
    token: string;
  };
}
