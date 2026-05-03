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

  if (!store) {
    return {
      title: "Odelink | Premium E-Commerce",
      description: "Build your luxury storefront in seconds.",
    };
  }

  const name = store.title || store.name || "Nova Luxury";
  const description = store.description || `${name} - Premium alışveriş deneyimi. En yeni koleksiyonları keşfedin.`;

  return {
    title: {
      template: `%s | ${name}`,
      default: name,
    },
    description: description,
    metadataBase: new URL(`https://${host}`),
    openGraph: {
      title: name,
      description: description,
      url: `https://${host}`,
      siteName: name,
      images: [
        {
          url: store.logoUrl || "/hero_italian.png",
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description: description,
      images: [store.logoUrl || "/hero_italian.png"],
    },
    robots: {
      index: true,
      follow: true,
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
      <body
        className={`${inter.variable} ${playfair.variable} font-sans min-h-full flex flex-col antialiased`}
      >
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
