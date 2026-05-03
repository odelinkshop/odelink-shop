export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  priceModifier?: number;
  stock: number;
}

export interface Variation {
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Fiyat string veya number gelebilir — hem "150 TL" hem 150 */
  price: string | number;
  oldPrice?: string | number | null;
  discountPercent?: number | null;
  category: string;
  images: string[];
  image?: string;
  variations?: Variation[];
  variants?: any;
  sizes?: string[];
  sku: string;
  isNew?: boolean;
  currency?: string;
  hasFreeShipping?: boolean;
  shopierUrl?: string;
  [key: string]: any;
}

export interface StoreSettings {
  currency: string;
  siteName: string;
  description: string;
  contact: any;
  about: any;
}
