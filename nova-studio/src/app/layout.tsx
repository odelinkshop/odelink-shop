import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/footer";
import AnnouncementBar from "@/components/layout/announcement-bar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

import { headers } from "next/headers";
import { getStoreData } from "@/lib/store-data";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const store = await getStoreData(host);

  const DEFAULT_DESC = "En kaliteli ürünler ve güvenli alışverişin adresi.";

  if (!store) {
    return {
      title: "Mağaza | Premium Alışveriş",
      description: DEFAULT_DESC,
    };
  }

  const shopName = store.title || store.name || "Mağaza";
  const shopDesc = store.description || `${shopName} - ${DEFAULT_DESC}`;
  
  return {
    title: {
      template: `%s | ${shopName}`,
      default: `${shopName} | Resmi Web Sitesi`,
    },
    description: shopDesc,
    keywords: [shopName, "online alışveriş", "lüks giyim", "aksesuar", "premium koleksiyon"],
    authors: [{ name: shopName }],
    metadataBase: new URL(`https://${host}`),
    alternates: { canonical: '/' },
    openGraph: {
      title: `${shopName} | Resmi Mağaza`,
      description: shopDesc,
      url: `https://${host}`,
      siteName: shopName,
      images: store.logoUrl ? [{ url: store.logoUrl, width: 1200, height: 630, alt: shopName }] : [],
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: shopName,
      description: shopDesc,
      images: store.logoUrl ? [store.logoUrl] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

function StoreSchema({ name, description, url, logo }: { name: string; description: string; url: string; logo?: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "name": name,
    "description": description,
    "url": url,
    ...(logo && { "logo": logo }),
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${url}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

import StoreInitializer from "@/components/providers/store-initializer";
import CustomCursor from "@/components/ui/custom-cursor";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const storeData = await getStoreData(host);

  return (
    <html lang="tr" className="h-full">
      <head>
        {/* Anti-Flash Theme Script - Locked to Parchment */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            document.documentElement.style.backgroundColor = '#F8F5F2';
          })();
        `}} />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans min-h-full flex flex-col antialiased bg-background`}
        style={{ backgroundColor: '#F8F5F2' }}
      >
        <CustomCursor />
        {storeData && (
          <StoreSchema 
            name={storeData.title || storeData.name} 
            description={storeData.description} 
            url={`https://${host}`} 
            logo={storeData.logoUrl}
          />
        )}
        <StoreInitializer />
        <AnnouncementBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
