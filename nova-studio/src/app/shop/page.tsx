
import { Metadata } from "next";
import { headers } from "next/headers";
import { getStoreData } from "@/lib/store-data";
import ShopClient from "./ShopClient";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const store = await getStoreData(host);

  if (!store) return { title: "Koleksiyon" };

  const name = store.name || "Koleksiyon";
  return {
    title: "Koleksiyon",
    description: `${name} mağazasındaki tüm ürünleri ve yeni koleksiyonları keşfedin.`,
    openGraph: {
      title: `Koleksiyon | ${name}`,
      description: `${name} mağazasındaki tüm ürünleri keşfedin.`,
      type: "website",
    }
  };
}

export default function Page() {
  return <ShopClient />;
}
