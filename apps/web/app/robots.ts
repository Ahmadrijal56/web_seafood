import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  // Selama demo situs tidak diindeks; set NEXT_PUBLIC_NOINDEX=false saat go-live.
  if (process.env.NEXT_PUBLIC_NOINDEX !== "false") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/keranjang", "/pesanan/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
