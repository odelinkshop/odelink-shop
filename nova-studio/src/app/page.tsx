import { Metadata } from "next";
import { headers } from "next/headers";
import { getStoreData } from "@/lib/store-data";
import HomeClient from "./HomeClient";

function getFallbackStoreName(host: string): string {
  if (!host) return "MAĞAZA";
  const cleanHost = host.replace("www.", "");
  if (cleanHost.includes("odelink.shop")) {
    const parts = cleanHost.split(".");
    if (parts.length >= 3 && parts[0] !== "www") {
      return parts[0].toUpperCase();
    }
  }
  return "MAĞAZA";
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const settings = await getStoreData(host);
  
  const shopName = settings?.name || settings?.title || getFallbackStoreName(host);
  const rawDesc = settings?.description || "";
  
  const seoTitle = `${shopName} | Premium Giyim & Klasik Şıklık | Resmi Web Sitesi`;
  const seoDescription = rawDesc.length > 20 
    ? rawDesc 
    : `En yeni trendler, klasik şıklık, kombinler ve lüks giyim koleksiyonları ${shopName} mağazasında sizi bekliyor. Güvenli ödeme ve hızlı teslimatla alışverişe başla!`;

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: [
      shopName,
      "klasik şıklık",
      "erkek giyim",
      "kombinler",
      "lüks giyim",
      "sessiz lüks",
      "premium ceketler",
      "hızlı teslimat",
      "güvenli alışveriş"
    ],
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: "website",
    }
  };
}

export default function Home() {
  return <HomeClient />;
}
