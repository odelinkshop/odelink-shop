import { create } from 'zustand';
import { Product } from '@/types/product';

interface StoreSettings {
  name: string;
  description: string;
  logoUrl?: string;
  design: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
  };
  content: {
    announcementBar: string;
    heroBadge?: string;
    heroDescription?: string;
    heroTitle: string;
    heroSubtitle: string;
    heroButtonText: string;
    heroImageUrl?: string;
    heroAccent?: string;
    aboutTitle?: string;
    aboutText?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactInstagram?: string;
  };
  manualProducts?: any[];
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
    instagram?: string;
  };
  contact_info?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  social_links?: {
    instagram?: string;
    x?: string;
    facebook?: string;
  };
  policies?: {
    privacy?: string;
    returns?: string;
    shipping?: string;
    kvkk?: string;
    cookies?: string;
  };
  pages?: {
    about?: string;
    privacy?: string;
    returns?: string;
    shipping?: string;
    faq?: string;
    blog?: string;
  };
  branding?: {
    hide_odelink_credit?: boolean;
    logo_url?: string;
    font_family?: string;
  };
}

interface StoreState {
  siteName: string;
  subdomain: string;
  settings: StoreSettings;
  store: {
    name: string;
    description: string;
    logoUrl?: string;
  } | null;
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchStoreData: (subdomain: string) => Promise<void>;
  updateFromEditor: (newSettings: any) => void;
}

const DEFAULT_DESIGN = {
  primaryColor: '#F8F5F2', 
  secondaryColor: '#0A0A0A', 
  accentColor: '#C5A059', 
  fontFamily: 'Playfair Display, serif'
};

const DEFAULT_CONTENT = {
  announcementBar: 'ÜCRETSİZ KARGO VE ÖZEL İNDİRİMLER!',
  heroTitle: '', 
  heroSubtitle: 'LIMITED COLLECTION',
  heroButtonText: 'KEŞFET',
  heroImageUrl: '',
  aboutTitle: 'HİKAYEMİZ',
  aboutText: 'Modern aristokrasinin sessiz lüksü ile tanışın.'
};

const slugify = (text: string) => {
  return text
    .toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[şŞ]/g, 's')
    .replace(/[ıİ]/g, 'i')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const mapProduct = (p: any, index: number): Product => {
  let name = (p.name || 'İsimsiz Ürün').toString().trim();
  const parts = name.split(' ');
  if (parts.length >= 2 && parts.length % 2 === 0) {
    const half = parts.length / 2;
    const firstHalf = parts.slice(0, half).join(' ');
    const secondHalf = parts.slice(half).join(' ');
    if (firstHalf === secondHalf) name = firstHalf;
  }

  const slug = slugify(p.slug || name || `product-${index}`);
  const displayPrice = p.price || '0 TL';
  const description = p.description || p.details || p.content || '';
  const sizes = Array.isArray(p.sizes) ? p.sizes : (Array.isArray(p.options) ? p.options : []);
  
  let variations = Array.isArray(p.variations) ? p.variations : [];
  if (variations.length === 0 && sizes.length > 0) {
    variations = [{ name: 'Beden', options: sizes }];
  }

  const sanitizeImg = (imgUrl: any) => {
    if (!imgUrl) return "";
    let url = typeof imgUrl === 'string' ? imgUrl : (imgUrl.imageUrl || imgUrl.image || "");
    return url;
  };

  const finalImages = (Array.isArray(p.images) && p.images.length > 0)
    ? p.images.map(sanitizeImg).filter(Boolean)
    : [sanitizeImg(p.image || p.imageUrl || p.thumb)].filter(Boolean);

  return {
    id: p.id || `p-${index}`,
    slug: slug,
    name: name,
    description: description,
    price: displayPrice,
    oldPrice: p.oldPrice || p.originalPrice || null,
    originalPrice: p.originalPrice || p.oldPrice || null,
    discountPercent: p.discountPercent || null,
    category: p.category || 'all',
    images: finalImages.length > 0 ? finalImages : [],
    sku: p.sku || `SKU-${p.id || index}`,
    isNew: index < 4,
    sizes: sizes,
    variants: {},
    variations: variations,
    currency: p.currency || 'TL',
    productType: p.productType || 'Fiziksel',
    shippingType: p.shippingType || '',
    shippingFee: p.shippingFee || 0,
    hasFreeShipping: Boolean(p.hasFreeShipping || p.shippingType === 'Ücretsiz Kargo'),
    shopierUrl: p.url || p.link || ""
  };
};

export const useStoreData = create<StoreState>((set, get) => ({
  siteName: 'Mağaza',
  subdomain: '',
  settings: {
    name: 'Mağaza',
    description: 'Premium e-commerce experience',
    design: DEFAULT_DESIGN,
    content: DEFAULT_CONTENT
  },
  products: [],
  store: null,
  isLoading: true,
  error: null,

  updateFromEditor: (newSettings: any) => {
    const currentState = get();
    const themeCustomization = newSettings.themeCustomization || newSettings || {};
    
    const design = { ...currentState.settings.design, ...(newSettings.design || {}) };
    const content = { ...currentState.settings.content, ...(newSettings.content || {}) };
    
    let updatedProducts = currentState.products;
    if (newSettings.manualProducts) {
      const shopierProducts = currentState.products.filter(p => !p.id.toString().startsWith('manual-'));
      const newManualMapped = newSettings.manualProducts.map((p: any, i: number) => mapProduct(p, i + 1000));
      
      // De-duplicate in Editor too
      const seen = new Set();
      updatedProducts = [...shopierProducts, ...newManualMapped].filter(p => {
        if (!p) return false;
        const key = (p.shopierUrl || p.url || p.name || "").toString().toLowerCase().trim();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    set({
      settings: {
        ...currentState.settings,
        ...newSettings,
        design,
        content,
        manualProducts: newSettings.manualProducts || currentState.settings.manualProducts
      },
      products: updatedProducts
    });
  },

  fetchStoreData: async (subdomain: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/sites/public/${subdomain}`);
      const data = await response.json();

      if (!data.ok && !data.site) throw new Error(data.error || 'Mağaza bulunamadı');

      const site = data.site;
      const settings = site.settings || {};
      
      const combined = [
        ...(Array.isArray(settings.products_data) ? settings.products_data : []),
        ...(Array.isArray(settings.manualProducts) ? settings.manualProducts : [])
      ];

      const design = { ...DEFAULT_DESIGN, ...(settings.design || {}) };
      const content = { ...DEFAULT_CONTENT, ...(settings.content || {}) };
      
      // De-duplicate: Use Shopier URL or name as unique key
      const seen = new Set();
      const uniqueCombined = combined.filter(p => {
        if (!p) return false;
        const key = (p.url || p.link || p.name || "").toString().toLowerCase().trim();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const tc = settings.themeCustomization || {};
      if (tc.announcementBar) content.announcementBar = tc.announcementBar;
      if (tc.heroBadge) content.heroBadge = tc.heroBadge;
      if (tc.heroLine1) content.heroTitle = tc.heroLine1;
      if (tc.heroSubtitle) content.heroSubtitle = tc.heroSubtitle;
      if (tc.heroDescription) content.heroDescription = tc.heroDescription;
      if (tc.heroAccent) content.heroAccent = tc.heroAccent;
      if (tc.aboutTitle) content.aboutTitle = tc.aboutTitle;
      if (tc.aboutText) content.aboutText = tc.aboutText;
      if (tc.heroImage1) content.heroImageUrl = tc.heroImage1;

      if (!content.heroTitle) content.heroTitle = site.name;

      if (typeof document !== 'undefined') {
        document.title = site.name || 'Mağaza';
      }

      set({
        siteName: (site.name || 'Mağaza')
          .replace(/Ödelink\s*\|\s*/gi, '')
          .replace(/Nova\s*\|\s*/gi, '')
          .split('|')[0]
          .trim(),
        subdomain: site.subdomain,
        store: {
          name: site.name,
          description: settings.description || '',
          logoUrl: settings.logoUrl
        },
        settings: {
          ...settings,
          name: site.name,
          description: settings.description || '',
          logoUrl: settings.logo_url || settings.branding?.logo_url || '',
          design,
          content,
          manualProducts: settings.manualProducts || [],
          policies: settings.policies || settings.pages || {},
          pages: settings.pages || settings.policies || {},
          contact: settings.contact || settings.contact_info || {},
          contact_info: settings.contact_info || settings.contact || {},
          social_links: settings.social_links || {},
          branding: settings.branding || {}
        },
        products: uniqueCombined.map((p, i) => mapProduct(p, i)),
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  }
}));
