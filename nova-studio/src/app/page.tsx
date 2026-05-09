import { Metadata } from "next";
import { headers } from "next/headers";
import { getStoreData } from "@/lib/store-data";
import HomeClient from "./HomeClient";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const settings = await getStoreData(host);
  
  return {
    title: settings?.name || "Odelink Shop",
    description: settings?.description || "Odelink Premium Storefront",
  };
}

export default function Home() {
  return <HomeClient />;
}
