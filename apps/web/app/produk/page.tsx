import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog } from "@/components/catalog";
import { PageHero } from "@/components/page-hero";
import { getCategories, getProducts, getSettings } from "@/lib/data";
import { toSummary } from "@/lib/product";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Katalog Seafood Segar",
  description: "Ikan laut, udang, lobster, kepiting, cumi, dan kerang segar dari TPI Muara Angke. Harga per kg, grosir, dan bisa dibersihkan.",
};

export default async function ProductsPage() {
  const [settings, categories, products] = await Promise.all([getSettings(), getCategories(), getProducts()]);
  const summaries = products.map(toSummary);
  return (
    <>
      <PageHero
        crumbs={[{ label: "Produk" }]}
        title="Katalog seafood segar"
        description={`${summaries.length} produk pilihan dari lelang TPI Muara Angke. Harga per kg — makin banyak makin murah.`}
      />
      <div className="container-page pb-16">
        <Suspense fallback={<div className="h-96" />}>
          <Catalog products={summaries} categories={categories} showPrices={settings.show_prices} />
        </Suspense>
      </div>
    </>
  );
}
