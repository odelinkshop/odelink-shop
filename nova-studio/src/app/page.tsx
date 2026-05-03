
import { Metadata } from "next";
import { headers } from "next/headers";
import { getStoreData } from "@/lib/store-data";
import HomeClient from "./HomeClient";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const store = await getStoreData(host);

  if (!store) {
    return {
      title: "Odelink | Premium Mağaza",
      description: "Saniyeler içinde profesyonel mağazanızı kurun."
    };
  }

  const name = store.title || store.name || "Nova Luxury";
  const desc = store.description || `${name} - Premium alışveriş deneyimi. Yeni sezon ürünleri keşfedin.`;

  return {
    title: name,
    description: desc,
    openGraph: {
      title: name,
      description: desc,
      images: [store.logoUrl || "/hero_italian.png"],
    }
  };
}

export default function Page() {
  return <HomeClient />;
}
