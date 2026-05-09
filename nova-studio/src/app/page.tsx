import { Metadata } from "next";
import { headers } from "next/headers";
import { getStoreData } from "@/lib/store-data";
import HomeClient from "./HomeClient";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const settings = await getStoreData();
  
  return {
    title: settings.name || "Odelink Shop",
    description: settings.content?.aboutText || "Odelink Premium Storefront",
  };
}

export default async function Home() {
  const settings = await getStoreData();
  
  return <HomeClient settings={settings} />;
}
