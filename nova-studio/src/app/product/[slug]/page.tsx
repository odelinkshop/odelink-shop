
import { Metadata } from "next";
import { headers } from "next/headers";
import { getStoreData } from "@/lib/store-data";
import { slugify } from "@/lib/utils";
import ProductClient from "./ProductClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const store = await getStoreData(host);
  
  if (!store) return { title: "Ürün Bulunamadı" };

  const product = store.products.find(p => p.slug === slug || slugify(p.name) === slug);

  if (!product) {
    return {
      title: "Ürün Bulunamadı",
      description: "Aradığınız ürün mağazamızda bulunmamaktadır."
    };
  }

  const name = product.name || "Ürün";
  const description = product.description 
    ? product.description.replace(/<[^>]*>/g, '').substring(0, 160) 
    : `${name} - ${store.name} koleksiyonunda.`;
  
  const image = product.images?.[0] || product.image || "/hero_italian.png";

  return {
    title: name,
    description: description,
    openGraph: {
      title: `${name} | ${store.name}`,
      description: description,
      images: [image],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description: description,
      images: [image],
    },
  };
}

export default async function Page({ params }: Props) {
  return <ProductClient />;
}
