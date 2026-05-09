import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getStoreData } from '@/lib/store-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const host = headersList.get('host') || "";
  const store = await getStoreData(host);
  
  const baseUrl = `https://${host}`;

  if (!store) {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
    ];
  }

  // Ana sayfa
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    }
  ];

  // Ürün sayfaları
  const productRoutes = (store.products || []).map((product: any) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Kategori sayfaları (Eğer varsa)
  const categories = [...new Set((store.products || []).map((p: any) => p.category).filter(Boolean))];
  const categoryRoutes = categories.map((cat: any) => ({
    url: `${baseUrl}/category/${cat.toLowerCase().replace(/ /g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...routes, ...productRoutes, ...categoryRoutes];
}
