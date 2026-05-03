
import { Metadata } from "next";
import { headers } from "next/headers";
import { getStoreData } from "@/lib/store-data";
import ShopClient from "../shop/ShopClient";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const store = await getStoreData(host);

  if (!store) return { title: "Outlet" };

  const name = store.name || "Outlet";
  return {
    title: "Outlet",
    description: `${name} mağazasındaki indirimli ürünleri keşfedin.`,
    openGraph: {
      title: `Outlet | ${name}`,
      description: `${name} mağazasındaki indirimli ürünleri keşfedin.`,
      type: "website",
    }
  };
}

export default function Page() {
  return <ShopClient />;
}
