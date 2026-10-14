import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data";
import { SITE_URL } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const pages = ["", "/produk", "/paket", "/resto-ekspor", "/tentang", "/testimoni", "/faq"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  return [
    ...pages,
    ...products.map((p) => ({
      url: `${SITE_URL}/produk/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
