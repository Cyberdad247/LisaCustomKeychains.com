import { MetadataRoute } from "next";
import { getAllProducts } from "../lib/shopify";

export const dynamic = "force-dynamic";
const BASE_URL = "https://lisascustomkeychains.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();

  const productUrls: MetadataRoute.Sitemap = products.map((product: any) => ({
    url: `${BASE_URL}/product/${product.node.handle}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/customize`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...productUrls,
  ];
}
