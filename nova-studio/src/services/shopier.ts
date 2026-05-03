import { Product, StoreSettings } from "@/types/product";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.odelink.shop";

export async function fetchStoreData() {
  if (typeof window === "undefined") return null;

  const hostname = window.location.hostname;
  let subdomain = "gcmoda"; // Fallback for development

  if (hostname.includes(".odelink.shop")) {
    subdomain = hostname.split(".")[0];
  } else if (hostname === "localhost" || hostname === "127.0.0.1") {
    // In local dev, we can use a query param or fallback
    const urlParams = new URLSearchParams(window.location.search);
    subdomain = urlParams.get("store") || "gcmoda";
  }

  try {
    const response = await fetch(`${API_URL}/api/shopier-products/products?subdomain=${subdomain}&theme=1`);
    const data = await response.json();

    if (data.ok) {
      return {
        products: data.products as Product[],
        settings: data.settings as StoreSettings
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch store data:", error);
    return null;
  }
}
