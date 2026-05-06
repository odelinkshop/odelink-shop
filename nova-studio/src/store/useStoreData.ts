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
  policies?: {
    privacy?: string;
    terms?: string;
    returns?: string;
    shipping?: string;
    kvkk?: string;
    cookies?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    instagram?: string;
  };
}

interface StoreState {
  siteName: string;
  subdomain: string;
  settings: StoreSettings;
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchStoreData: (subdomain: string) => Promise<void>;
  updateFromEditor: (newSettings: any) => void;
}

const DEFAULT_DESIGN = {
  primaryColor: '#F2EBE1', // Cream
  secondaryColor: '#111111', // Black
  accentColor: '#C5A059', // Gold
  fontFamily: 'Inter, sans-serif'
};

const DEFAULT_CONTENT = {
  announcementBar: 'ÜCRETSİZ KARGO VE ÖZEL İNDİRİMLER!',
  heroTitle: '', 
  heroSubtitle: 'ESTATE ITALIANA \'26',
  heroButtonText: 'KOLEKSİYONU KEŞFET',
  heroImageUrl: '',
  aboutTitle: 'HİKAYEMİZ',
  aboutText: 'Modern aristokrasinin sessiz lüksü ile tanışın.'
};

const slugify = (text: string) => {
  return text
    .toString()
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
    .replace(/\-\-+/g, '-');
};

const mapProduct = (p: any, index: number): Product => {
  // İsim tekrarını engelle (örn: "Ürün Ürün" -> "Ürün")
  let name = (p.name || 'İsimsiz Ürün').toString().trim();
  const parts = name.split(' ');
  if (parts.length >= 2 && parts.length % 2 === 0) {
    const half = parts.length / 2;
    const firstHalf = parts.slice(0, half).join(' ');
    const secondHalf = parts.slice(half).join(' ');
    if (firstHalf === secondHalf) name = firstHalf;
  }

  const slug = p.slug || slugify(name) || `product-${index}`;
  const displayPrice = p.price || '0 TL';
  const description = p.description || p.details || p.content || '';
  const sizes = Array.isArray(p.sizes) ? p.sizes : (Array.isArray(p.options) ? p.options : []);
  
  let variations = Array.isArray(p.variations) ? p.variations : [];
  if (variations.length === 0 && sizes.length > 0) {
    variations = [{ name: 'Beden', options: sizes }];
  }

  const sanitizeImg = (p: any) => {
    if (!p) return "/hero_italian.png";
    let url = "";
    if (typeof p === 'string') url = p;
    else if (p.imageUrl) url = p.imageUrl;
    else if (p.image) url = p.image;
    else if (p.thumb) url = p.thumb;
    else if (p.image_url) url = p.image_url;
    else if (Array.isArray(p.images) && p.images.length > 0) url = p.images[0];
    
    if (!url) return "/hero_italian.png";
    
    // Shopier 4K Force kapatıldı (Bazı ürünlerde xlarge 404 dönüyor) -> Daha güvenilir olan 'large' boyutuna zorla
    if (url.includes('cdn.shopier.app/pictures')) {
      return url.replace(/pictures_(mid|xlarge|small|mid_mid|standard|mid_large|thumb)/, 'pictures_large');
    }
    
    return url;
  };

  const finalImages = (Array.isArray(p.images) && p.images.length > 0)
    ? p.images.map(sanitizeImg).filter(Boolean)
    : [sanitizeImg(p.image || p.imageUrl || p.primary_image || p.main_image || p.img || p.thumb)].filter(Boolean);

  return {
    id: p.id || `p-${index}`,
    slug: slug,
    name: name,
    description: description,
    price: displayPrice,
    oldPrice: p.oldPrice || null,
    discountPercent: p.discountPercent || null,
    category: p.category || 'all',
    images: finalImages.length > 0 ? finalImages : ['/hero_italian.png'],
    sku: p.sku || `SHP-${p.id || index}`,
    isNew: index < 4,
    sizes: sizes,
    variants: {},
    variations: variations,
    hasFreeShipping: Boolean(p.hasFreeShipping),
    shopierUrl: p.url || p.link
  };
};

export const useStoreData = create<StoreState>((set, get) => ({
  siteName: 'Nova Luxury',
  subdomain: '',
  settings: {
    name: 'Nova Luxury',
    description: 'Premium e-commerce experience',
    design: DEFAULT_DESIGN,
    content: DEFAULT_CONTENT
  },
  products: [],
  isLoading: true,
  error: null,

  updateFromEditor: (newSettings: any) => {
    const currentState = get();
    
    // Extract design and content from themeCustomization if provided
    const themeCustomization = newSettings.themeCustomization || newSettings || {};
    
    const design = { 
      ...currentState.settings.design, 
      ...(newSettings.design || {}),
      // Map flat fields if they exist
      ...(themeCustomization.primaryColor ? { primaryColor: themeCustomization.primaryColor } : {})
    };
    
    const content = { 
      ...currentState.settings.content, 
      ...(newSettings.content || {}),
      // Map flat fields from themeCustomization
      ...(themeCustomization.announcementBar ? { announcementBar: themeCustomization.announcementBar } : {}),
      ...(themeCustomization.heroBadge ? { heroBadge: themeCustomization.heroBadge } : {}),
      ...(themeCustomization.heroLine1 ? { heroTitle: themeCustomization.heroLine1 } : {}),
      ...(themeCustomization.heroSubtitle ? { heroSubtitle: themeCustomization.heroSubtitle } : {}),
      ...(themeCustomization.heroDescription ? { heroDescription: themeCustomization.heroDescription } : {}),
      ...(themeCustomization.heroAccent ? { heroAccent: themeCustomization.heroAccent } : {}),
      ...(themeCustomization.aboutTitle ? { aboutTitle: themeCustomization.aboutTitle } : {}),
      ...(themeCustomization.aboutText ? { aboutText: themeCustomization.aboutText } : {}),
      ...(themeCustomization.heroImage1 ? { heroImageUrl: themeCustomization.heroImage1 } : {})
    };
    
    let updatedProducts = currentState.products;
    if (newSettings.manualProducts) {
      const shopierProducts = currentState.products.filter(p => !p.id.toString().startsWith('manual-'));
      const newManualMapped = newSettings.manualProducts.map((p: any, i: number) => mapProduct(p, i + 1000));
      updatedProducts = [...shopierProducts, ...newManualMapped];
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

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--background', design.primaryColor);
      root.style.setProperty('--nova-primary', design.primaryColor);
      root.style.setProperty('--nova-secondary', design.secondaryColor);
      root.style.setProperty('--nova-accent', design.accentColor);
      root.style.setProperty('--foreground', design.secondaryColor);
    }
  },

  fetchStoreData: async (subdomain: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/sites/public/${subdomain}`);
      const data = await response.json();

      if (!data.ok && !data.site) throw new Error(data.error || 'Mağaza bulunamadı');

      const site = data.site;
      const settings = site.settings || {};
      
      const shopierProducts = Array.isArray(settings.products_data) ? settings.products_data : [];
      const manualProducts = Array.isArray(settings.manualProducts) ? settings.manualProducts : [];
      const combined = [...shopierProducts, ...manualProducts];

      const design = { ...DEFAULT_DESIGN, ...(settings.design || {}) };
      const content = { ...DEFAULT_CONTENT, ...(settings.content || {}) };
      
      // Map themeCustomization flat fields from DB
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

      // CSS Variables Initial Update
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        root.style.setProperty('--background', design.primaryColor);
        root.style.setProperty('--nova-primary', design.primaryColor);
        root.style.setProperty('--nova-secondary', design.secondaryColor);
        root.style.setProperty('--nova-accent', design.accentColor);
        root.style.setProperty('--foreground', design.secondaryColor);
        document.title = `Ödelink | ${site.name || 'Nova'}`;
      }

      set({
        siteName: (site.name || 'Nova Luxury').split('|')[0].trim(),
        subdomain: site.subdomain,
        settings: {
          name: site.name,
          description: settings.description || '',
          logoUrl: settings.logoUrl,
          design,
          content,
          manualProducts,
          policies: settings.policies,
          contact: settings.contact
        },
        products: combined.map((p, i) => mapProduct(p, i)),
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  }
}));
