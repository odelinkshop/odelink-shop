
/**
 * Odelink Server-Side Store Data Fetcher
 * Used for Metadata Generation and SEO Optimization
 */

export interface StoreInfo {
  name: string;
  subdomain: string;
  description: string;
  title?: string;
  logoUrl?: string;
  products: any[];
  settings: any;
}

export async function getStoreData(hostname: string): Promise<StoreInfo | null> {
  try {
    // Determine subdomain from hostname
    let subdomain = 'demo';
    if (hostname.includes('odelink.shop')) {
      const parts = hostname.split('.');
      if (parts.length >= 3) {
        subdomain = parts[0];
        if (subdomain === 'www') subdomain = 'demo';
      }
    } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
      subdomain = 'demo';
    } else {
      // Custom domain support logic could go here
      subdomain = 'demo'; 
    }

    const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${apiUrl}/sites/public/${subdomain}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) return null;
    const data = await res.json();
    
    if (!data.site) return null;

    return {
      name: data.site.name,
      subdomain: data.site.subdomain,
      description: data.site.settings?.seoDescription || data.site.settings?.description || '',
      title: data.site.settings?.seoTitle || data.site.name,
      logoUrl: data.site.settings?.logoUrl,
      products: data.site.settings?.products_data || [],
      settings: data.site.settings || {}
    };
  } catch (error) {
    console.error('❌ Error fetching store data for SEO:', error);
    return null;
  }
}
